using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;

namespace Models
{
    /// <summary>
    /// Files Class.    
    /// Class holds files data upload /download to sharepoint
    /// </summary>
    /// <uses>
    ///     Logger
    ///     Sql
    /// </uses>
    public class Files
    {
        /// <summary>
        /// Name
        /// Database field : Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Filepath
        /// Database field : Filepath
        /// </summary>
        public string Filepath { get; set; }

        /// <summary>
        /// FileType
        /// Database field : FileType
        /// </summary>
        public string FileType { get; set; }

        /// <summary>
        /// IsDelete
        /// Database field : IsDelete
        /// </summary>
        public bool IsDelete { get; set; }

        /// <summary>
        /// AttachmentStatus
        /// Database field : AttachmentStatus
        /// </summary>
        public string AttachmentStatus { get; set; }

        /// <summary>
        /// FileContent
        /// </summary>
        public HttpPostedFile FileContent { get; set; }

        /// <summary>
        /// Upload file for quote
        /// </summary>
        /// <param name="file"></param>
        /// <param name="filePath"></param>
        /// <param name="fileName"></param>
        public static void FileUploadForHttpHandler(HttpPostedFile file, string filePath, string fileName)
        {
            if (filePath == "1") //To identify the root folder.
            {
                filePath = ConfigurationManager.AppSettings["AttachmentLocation"];
            }

            filePath = ConfigurationManager.AppSettings["AttachmentLocation"] + filePath;

            var sharepointRootFolder = ConfigurationManager.AppSettings["AttachmentLocation"];

            try
            {
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }

                var uniqueIdFileName = filePath + "\\" + fileName;
                file.SaveAs(uniqueIdFileName);
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        /// <summary>
        /// File list from folder.
        /// </summary>       
        /// <param name="bidId">meeting Topic Record ID</param>
        /// <returns>List of file from folder</returns>
        public static IList<Files> FileListFromFolder(int bidId)
        {
            var files = new List<Files>();
            var sharepointRootFolder = ConfigurationManager.AppSettings["AttachmentLocation"];

            try
            {
                var subPath = sharepointRootFolder + bidId;

                var exists = Directory.Exists(subPath);

                if (!exists)
                {
                    return files.ToList();
                }
                var dirInfo = new DirectoryInfo(subPath);

                foreach (var fileInfo in dirInfo.GetFiles())
                {
                    var filePath = subPath + "\\" + fileInfo.Name;
                    var contentType = "application/octetstream";
                    var ext = Path.GetExtension(fileInfo.Name).ToLower();

                    var registryKey = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
                    if (registryKey?.GetValue("Content Type") != null)
                        contentType = registryKey.GetValue("Content Type").ToString();

                    files.Add(new Files { Filepath = filePath, Name = fileInfo.Name, FileType = contentType });
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return files.ToList();
        }

        /// <summary>
        /// Delete file of quote
        /// </summary>
        public static void DeleteFile(int bidId, string fileName)
        {
            var sharepointRootFolder = ConfigurationManager.AppSettings["AttachmentLocation"];

            try
            {
                var filePath = sharepointRootFolder + bidId.ToString() + "\\" + fileName;

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}