using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace Models
{
    /// <summary>
    /// Quote users class
    /// Class holds data to user drop down list
    /// <users>
    ///     client
    ///     sql
    /// </users>
    /// </summary>
    public class QuoteUsers
    {
        /// <summary>
        /// User record id
        /// Database field: UserRecordId 
        /// </summary>
        public int UserRecordId { get; set; }

        /// <summary>
        /// User Name
        /// Database field: UserName
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// To get all Users
        /// </summary>
        /// <param name="quoteConnection">Sql connection</param>
        /// <returns></returns>
        public static List<QuoteUsers> Get(string quoteConnection)
        {
            var dt = new DataTable();

            try
            {
                dt = QuoteSql.GetRecord("spASQT_GetQuoteUsers", quoteConnection);
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
        ///     List of User
        /// </returns>
        private static List<QuoteUsers> ProcessList(DataTable dt)
        {
            List<QuoteUsers> list;

            try
            {
                list = dt.AsEnumerable()
                        .Select(quoteUsers => new QuoteUsers
                        {
                            UserRecordId = quoteUsers.Field<int>("UserRecordId"),
                            UserName = quoteUsers.Field<string>("Name"),
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