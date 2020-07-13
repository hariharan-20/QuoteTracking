using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Models
{
    /// <summary>
    /// Quote Master class
    /// Class holds data of list options
    /// <users>
    ///     client
    ///     Sql
    /// </users>
    /// </summary>
    public class QuoteMaster
    {
        /// <summary>
        /// Method for Mater quote status
        /// </summary>
        public List<QuoteStatus> MasterQuoteStatus { get; set; }

        /// <summary>
        /// Method for Mater Departments
        /// </summary>
        public List<Department> MasterDepartments { get; set; }

        /// <summary>
        /// Method for Mater PO status
        /// </summary>
        public List<POStatus> MasterPOStatus { get; set; }

        /// <summary>
        /// Method for Mater invoice status
        /// </summary>
        public List<InvoiceStatus> MasterInvoiceStatus { get; set; }

        /// <summary>
        /// Method for Mater users
        /// </summary>
        public List<QuoteUsers> MasterUserDetails { get; set; }
    }
}