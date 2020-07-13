using Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Models
{
    public class Quote
    {
        /// <summary>
        /// Quote Number
        /// Database field: QuoteNumber
        /// </summary>
        public int QuoteNumber { get; set; }

        /// <summary>
        /// Quote Quote status
        /// Database field: QuoteStatus
        /// </summary>
        public string QuoteStatus { get; set; }

        /// <summary>
        /// Quote Quote status code
        /// Database field: QuoteStatusCode
        /// </summary>
        public string QuoteStatusCode { get; set; }

        /// <summary>
        /// Quote Department record id
        /// Database field: DepartmentRecordId
        /// </summary>
        public int DepartmentRecordId { get; set; }

        /// <summary>
        /// Quote Department
        /// Database field: Department
        /// </summary>
        public string Department { get; set; }

        /// <summary>
        /// Quote Description
        /// Database field: Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Quote Estimated hours
        /// Database field: EstimatedHours
        /// </summary>
        public decimal EstimatedHours { get; set; }

        /// <summary>
        /// Quote Estimated date
        /// Database field: EstimatedDate
        /// </summary>
        public DateTime EstimatedDate { get; set; }

        /// <summary>
        /// Quote Requisition Number
        /// Database field: RequisitionNumber
        /// </summary>
        public int? RequisitionNumber { get; set; }

        /// <summary>
        /// Quote Requisition Date
        /// Database field: RequisitonDate
        /// </summary>
        public DateTime? RequisitionDate { get; set; }

        /// <summary>
        /// Quote PO number
        /// Database field: PONumber
        /// </summary>
        public int? PONumber { get; set; }

        /// <summary>
        /// Quote PO date
        /// Database field: PODate
        /// </summary>
        public DateTime? PODate { get; set; }

        /// <summary>
        /// Quote PO status
        /// Database field: POStatus
        /// </summary>
        public string POStatus { get; set; }

        /// <summary>
        /// Quote PO status code
        /// Database field: POStatusCode
        /// </summary>
        public string POStatusCode { get; set; }

        /// <summary>
        /// Quote Invoice number
        /// Database field: InvoiceNumber
        /// </summary>
        public int? InvoiceNumber { get; set; }

        /// <summary>
        /// Quote Invoice date
        /// Database field: InvoiceDate
        /// </summary>
        public DateTime? InvoiceDate { get; set; }

        /// <summary>
        /// Quote Invioce status
        /// Database field: InvoiceStatus
        /// </summary>
        public string InvoiceStatus { get; set; }

        /// <summary>
        /// Quote Invoice status code
        /// Database field: invoiceStausCode
        /// </summary>
        public string InvoiceStatusCode { get; set; }

        /// <summary>
        /// Quote User record id
        /// Database field: UserRecordId
        /// </summary>
        public int UserRecordId { get; set; }

        /// <summary>
        /// Quote User name
        /// Database field: UserName
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// To set quote as Requoted
        /// Database field: isRequote
        /// </summary>
        public bool? IsReQuote { get; set; }

        /// <summary>
        /// To set quote as deleted
        /// Database field: None
        /// </summary>
        public bool? IsDelete { get; set; }

        /// <summary>
        /// Quote attachments
        /// Database field: None
        /// </summary>
        public List<Files> Attachments { get; set; }

        /// <summary>
        /// Get quote tracking details
        /// </summary>
        /// <param name="quoteConnection">Connection string</param>
        /// <param name="FilterQuery"></param>
        /// <returns>
        /// List of quotes
        /// </returns>
        public static List<Quote> Get(string quoteConnection, string FilterQuery)
        {
            var dt = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(quoteConnection))
                {
                    conn.Open();
                    SqlCommand getQuotesCmd = new SqlCommand("spASQT_GetQuotes", conn);
                    getQuotesCmd.CommandType = CommandType.StoredProcedure;

                    getQuotesCmd.Parameters.AddWithValue("@FilterQuery", FilterQuery);

                    var sda = new SqlDataAdapter(getQuotesCmd);

                    sda.Fill(dt);
                };
            }

            catch (Exception ex)
            {
                throw ex;
            }

            return ProcessList(dt);
        }

        /// <summary>
        /// Get Quote By quote Number
        /// </summary>
        /// <param name="quoteConnection"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Quote Get(string quoteConnection, int id)
        {
            var dt = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(quoteConnection))
                {
                    conn.Open();
                    SqlCommand getQuoteByIdCmd = new SqlCommand("spASQT_GetQuoteById", conn);
                    getQuoteByIdCmd.CommandType = CommandType.StoredProcedure;

                    getQuoteByIdCmd.Parameters.AddWithValue("@QuoteNumber", id);

                    var sda = new SqlDataAdapter(getQuoteByIdCmd);

                    sda.Fill(dt);
                };
            }

            catch (Exception ex)
            {
                throw ex;
            }

            return ProcessList(dt)[0];
        }

        /// <summary>
        /// Connvert DataTable to List
        /// </summary>
        /// <param name="dt">Quote details</param>
        /// <returns>
        ///     List of quote
        /// </returns>
        private static List<Quote> ProcessList(DataTable dt)
        {
            List<Quote> list;

            try
            {
                list = dt.AsEnumerable()
                        .Select(quotes => new Quote
                        {
                            QuoteNumber = quotes.Field<int>("QuoteNumber"),
                            QuoteStatus = quotes.Table.Columns.Contains("QuoteStatus") ?
                                                    quotes.Field<string>("QuoteStatus") : "",
                            QuoteStatusCode = quotes.Table.Columns.Contains("QuoteStatusCode") ?
                                                    quotes.Field<string>("QuoteStatusCode") : "",
                            DepartmentRecordId = quotes.Table.Columns.Contains("DepartmentRecordId") ?
                                                    quotes.Field<int>("DepartmentRecordId") : -1,
                            Department = quotes.Table.Columns.Contains("Department") ?
                                                    quotes.Field<string>("Department") : "",
                            Description = quotes.Field<string>("Description"),
                            EstimatedHours = quotes.Field<decimal>("EstimatedHours"),
                            EstimatedDate = quotes.Field<DateTime>("EstimatedDate"),
                            UserName = quotes.Table.Columns.Contains("UserName") ?
                                                    quotes.Field<string>("UserName") : "",
                            UserRecordId = quotes.Table.Columns.Contains("UserRecordId") ?
                                                    quotes.Field<int>("UserRecordId") : -1,
                            RequisitionNumber = quotes.Field<int?>("RequisitionNumber"),
                            RequisitionDate = quotes.Field<DateTime?>("RequisitionDate"),
                            PONumber = quotes.Field<int?>("PONumber"),
                            PODate = quotes.Field<DateTime?>("PODate"),
                            POStatus = quotes.Table.Columns.Contains("POStatus") ?
                                                    quotes.Field<string>("POStatus") : "",
                            POStatusCode = quotes.Table.Columns.Contains("POStatusCode") ?
                                                    quotes.Field<string>("POStatusCode") : "",
                            InvoiceNumber = quotes.Field<int?>("InvoiceNumber"),
                            InvoiceDate = quotes.Field<DateTime?>("InvoiceDate"),
                            InvoiceStatus = quotes.Table.Columns.Contains("InvoiceStatus") ?
                                                    quotes.Field<string>("InvoiceStatus") : "",
                            InvoiceStatusCode = quotes.Table.Columns.Contains("InvoiceStatusCode") ?
                                                    quotes.Field<string>("InvoiceStatusCode") : "",
                            IsReQuote = quotes.Table.Columns.Contains("IsReQuote") ?
                                                    quotes.Field<bool?>("IsReQuote") : false,
                            IsDelete = quotes.Table.Columns.Contains("IsDelete") ?
                                                    quotes.Field<bool?>("IsDelete") : false,

                        }).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return list;
        }

        /// <summary>
        /// Save quote
        /// </summary>
        /// <param name="quoteConnection">Connection string</param>
        /// <param name="quote">Quote details</param>
        /// <returns>
        /// Quote number     
        /// </returns>
        public static int Save(string quoteConnection, Quote quote)
        {
            var quoteNumber = -1;

            try
            {
                using (SqlConnection conn = new SqlConnection(quoteConnection))
                {
                    conn.Open();
                    SqlCommand saveCmd = new SqlCommand("spASQT_SaveQuote", conn);
                    saveCmd.CommandType = CommandType.StoredProcedure;

                    saveCmd.Parameters.AddWithValue("@QuoteNumber", quote.QuoteNumber);
                    saveCmd.Parameters.AddWithValue("@QuoteStatusCode", quote.QuoteStatusCode);
                    saveCmd.Parameters.AddWithValue("@DepartmentRecordId", quote.DepartmentRecordId);
                    saveCmd.Parameters.AddWithValue("@Description", quote.Description);
                    saveCmd.Parameters.AddWithValue("@EstimatedHours", quote.EstimatedHours);
                    saveCmd.Parameters.AddWithValue("@EstimatedDate", quote.EstimatedDate);
                    saveCmd.Parameters.AddWithValue("@UserRecordId", quote.UserRecordId);
                    saveCmd.Parameters.AddWithValue("@RequisitionNumber", quote.RequisitionNumber);
                    saveCmd.Parameters.AddWithValue("@RequisitionDate", quote.RequisitionDate);
                    saveCmd.Parameters.AddWithValue("@PONumber", quote.PONumber);
                    saveCmd.Parameters.AddWithValue("@PODate", quote.PODate);
                    saveCmd.Parameters.AddWithValue("@POStatusCode", quote.POStatusCode);
                    saveCmd.Parameters.AddWithValue("@InvoiceNumber", quote.InvoiceNumber);
                    saveCmd.Parameters.AddWithValue("@InvoiceDate", quote.InvoiceDate);
                    saveCmd.Parameters.AddWithValue("@InvoiceStatusCode", quote.@InvoiceStatusCode);
                    saveCmd.Parameters.AddWithValue("@IsReQuote", quote.IsReQuote);

                    quoteNumber = int.Parse(saveCmd.ExecuteScalar().ToString());
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return quoteNumber;
        }
        /// <summary>
        /// Delete quote
        /// </summary>
        /// <param name="quoteConnection">Connection string</param>
        /// <param name="quoteNumber">Quote number</param>
        /// <returns></returns>
        public static int Delete(string quoteConnection, int quoteNumber)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(quoteConnection))
                {
                    conn.Open();
                    SqlCommand deleteQuote = new SqlCommand("spASQT_DeleteQuote", conn);
                    deleteQuote.CommandType = CommandType.StoredProcedure;
                    deleteQuote.Parameters.AddWithValue("@QuoteNumber", quoteNumber);
                    deleteQuote.ExecuteNonQuery();
                    return quoteNumber;
                };
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
