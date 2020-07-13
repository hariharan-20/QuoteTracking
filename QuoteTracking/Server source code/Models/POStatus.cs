using Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace Models
{
    public class POStatus
    {
        /// <summary>
        /// PO status name
        /// Databse field: POStatusName 
        /// </summary>
        public string POStatusName { get; set; }

        /// <summary>
        /// Description
        /// Database field: [Description]
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// PO status code
        /// Database field: POStatusCode
        /// </summary>
        public string POStatusCode { get; set; }


        /// <summary>
        /// To get all PO status
        /// </summary>
        /// <param name="quoteConnection">Sql connection</param>
        /// <returns></returns>
        public static List<POStatus> Get(string quoteConnection)
        {
            var dt = new DataTable();

            try
            {
                dt = QuoteSql.GetRecord("spASQT_GetPOStatus", quoteConnection);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ProcessList(dt);
        }

        /// <summary>
        /// Connvert DataTable to List
        /// </summary>
        /// <param name="dt">Quote details</param>
        /// <returns>
        ///     List of PO status
        /// </returns>
        private static List<POStatus> ProcessList(DataTable dt)
        {
            List<POStatus> list;

            try
            {
                list = dt.AsEnumerable()
                        .Select(poStatus => new POStatus
                        {
                            POStatusName = poStatus.Field<string>("POStatus"),
                            Description = poStatus.Field<string>("Description"),
                            POStatusCode = poStatus.Field<string>("StatusCode")
                        }).ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return list;
        }
    }
}