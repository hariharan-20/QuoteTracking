using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace Models
{

    /// <summary>
    /// Invioce status class
    /// Class holds Load data to drop down list
    /// <users>
    ///     client
    ///     sql
    /// </users>
    /// </summary>
    public class InvoiceStatus
    {
        /// <summary>
        /// Invoice status name
        /// Databse field: InvoiceStatusName 
        /// </summary>
        public string InvoiceStatusName { get; set; }

        /// <summary>
        /// Description
        /// Database field: [Description]
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Invoice status code
        /// Database field: InvoiceStatusCode
        /// </summary>
        public string InvoiceStatusCode { get; set; }

        /// <summary>
        /// To get all invoice status
        /// </summary>
        /// <param name="quoteConnection">Sql connection</param>
        /// <returns></returns>
        public static List<InvoiceStatus> Get(string quoteConnection)
        {
            var dt = new DataTable();

            try
            {
                dt = QuoteSql.GetRecord("spASQT_GetInvoiceStatus", quoteConnection);
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
        ///     List of invoice status
        /// </returns>
        private static List<InvoiceStatus> ProcessList(DataTable dt)
        {
            List<InvoiceStatus> list;

            try
            {
                list = dt.AsEnumerable()
                        .Select(invoiceStatus => new InvoiceStatus
                        {
                            InvoiceStatusName = invoiceStatus.Field<string>("InvoiceStatus"),
                            Description = invoiceStatus.Field<string>("Description"),
                            InvoiceStatusCode = invoiceStatus.Field<string>("StatusCode")
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