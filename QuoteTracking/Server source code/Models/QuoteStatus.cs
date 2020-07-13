using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace Models
{
    public class QuoteStatus
    {
        /// <summary>
        /// Quote status name
        /// Databse field: QuoteStatusName 
        /// </summary>
        public string QuoteStatusName { get; set; }

        /// <summary>
        /// Description
        /// Database field: [Description]
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Quote status code
        /// Database field: QuoteStatusCode
        /// </summary>
        public string QuoteStatusCode { get; set; }

        /// <summary>
        /// To get all Quote status
        /// </summary>
        /// <param name="quoteConnection">Sql connection</param>
        /// <returns></returns>
        public static List<QuoteStatus> Get(string quoteConnection)
        {
            var dt = new DataTable();

            try
            {
                dt = QuoteSql.GetRecord("spASQT_GetQuoteStatus", quoteConnection);
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
        ///     List of Quote status
        /// </returns>
        private static List<QuoteStatus> ProcessList(DataTable dt)
        {
            List<QuoteStatus> list;

            try
            {
                list = dt.AsEnumerable()
                        .Select(quoteStatus => new QuoteStatus
                        {
                            QuoteStatusName = quoteStatus.Field<string>("QuoteStatus"),
                            Description = quoteStatus.Field<string>("Description"),
                            QuoteStatusCode = quoteStatus.Field<string>("StatusCode")
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