using Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace ASQuoteTracking.Controllers
{
    /// <summary>
    /// AS Quote tracking controller
    /// </summary>
    public class QuoteController : ApiController
    {
        /// <summary>
        /// Connection string for quote tracking
        /// </summary>
        public string Conn = ConfigurationManager.ConnectionStrings["ASQuoteDB"].ConnectionString;

        /// <summary>
        /// Get all master details for quote tracking
        /// </summary>
        /// <returns></returns>
        [Route("api/QuoteMaster")]
        public QuoteMaster GetQuoteMaster()
        {
            return new QuoteMaster
            {
                MasterQuoteStatus = QuoteStatus.Get(Conn),
                MasterDepartments = Department.Get(Conn),
                MasterInvoiceStatus = InvoiceStatus.Get(Conn),
                MasterPOStatus = POStatus.Get(Conn),
                MasterUserDetails = QuoteUsers.Get(Conn)
            };
        }

        /// <summary>
        /// Get all quote tracking details
        /// </summary>
        /// <returns></returns>
        public IHttpActionResult Get()
        {
            var filterQuery = "";
            var headers = Request.Headers;

            if (headers.Contains("FilterQuery"))
            {
                filterQuery = headers.GetValues("FilterQuery").First();
            }
            
            return Ok(Quote.Get(Conn, filterQuery));
        }

        /// <summary>
        /// Get quote details fot given quote id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public IHttpActionResult Get(int id)
        {
            var quote = Quote.Get(Conn, id);

            quote.Attachments = GetAttachments(id);

            return Ok(quote);
        }

        /// <summary>
        /// Save quote tracking
        /// </summary>
        /// <param name="Quote">Quote details</param>
        /// <returns></returns>
        public int Post()
        {
            try
            {
                var quoteFromRequest = HttpContext.Current.Request["quote"];
                var quoteJSON = JObject.Parse(quoteFromRequest);
                var quote = quoteJSON.ToObject<Quote>();
                var quoteNumber = Quote.Save(Conn, quote); // Save quote details
                var httpRequest = HttpContext.Current.Request;

                // Delete attachments of quote 
                foreach (var attachment in quote.Attachments)
                {
                    if (string.Equals(attachment.AttachmentStatus, "D"))
                    {
                        Files.DeleteFile(quoteNumber, attachment.Name);
                    }
                }

                // Add attachments of quote 
                if (httpRequest.Files.Count > 0)
                {
                    for (var iIndex = 0; iIndex < httpRequest.Files.Count; iIndex++)
                    {
                        var postedFile = httpRequest.Files[iIndex];
                        Files.FileUploadForHttpHandler(postedFile, quoteNumber.ToString(), postedFile.FileName);
                    }
                }

                return quoteNumber;
            }
            catch (Exception ex)
            {
                throw new ApplicationException(ex.Message);
            }
        }

        /// <summary>
        /// Get all attachments
        /// </summary>
        /// <param name="quoteNumber">Quote number</param>
        /// <returns>List of attachments</returns>
        public List<Files> GetAttachments(int quoteNumber)
        {
            try
            {
                var serverFiles = Files.FileListFromFolder(quoteNumber);
                var attachments = serverFiles.Select(serverFile => new Files
                {
                    Name = serverFile.Name,
                    FileType = serverFile.FileType.Split('/').ToList()[1],
                    AttachmentStatus = "U"
                }).ToList();

                return attachments.ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// To download Attachments
        /// </summary>
        /// <param name="quotenumber">Quote number</param>
        /// <param name="filename">Attachment name</param>
        /// <param name="extension">Attchment format name</param>
        [HttpGet]
        [Route("api/DownloadAttachment/{quotenumber}/{filename}/{extension}")]
        public void Get(int quotenumber, string filename, string extension)
        {
            var sharepointRootFolder = ConfigurationManager.AppSettings["AttachmentLocation"];

            try
            {
                var filefullname = filename + "." + extension;
                var filePath = sharepointRootFolder + quotenumber.ToString() + "\\" + filefullname;
                var response = HttpContext.Current.Response;

                response.ClearContent();
                response.Clear();
                response.ContentType = "application/octet-stream";
                response.AppendHeader("Content-Disposition", "attachment; filename=\"" + filefullname + "\"");
                response.TransmitFile(filePath);
                response.Flush();
                response.End();
                HttpContext.Current.ApplicationInstance.CompleteRequest();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Delete quote
        /// </summary>
        /// <param name="quoteNumber">Quote number</param>
        /// <returns></returns>
        public IHttpActionResult Delete(int quoteNumber)
        {
            try
            {
                return Ok(Quote.Delete(Conn, quoteNumber));
            }
            catch (Exception ex)
            {
                throw new ApplicationException(ex.Message);
            }
        }
    }
}
