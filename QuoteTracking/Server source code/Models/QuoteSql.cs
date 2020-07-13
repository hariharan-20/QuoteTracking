using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Models
{
    /// <summary>
    /// Database connection
    /// </summary>
    public class QuoteSql
    {
        /// <summary>
        /// Get records for given stored procedure
        /// </summary>
        /// <param name="spName"></param>
        /// <param name="connsectionString"></param>
        /// <returns></returns>
        public static DataTable GetRecord(string spName, string connsectionString)
        {
            var dt = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(connsectionString))
                {
                    conn.Open();

                    var cmd = new SqlCommand(spName, conn);

                    cmd.CommandType = CommandType.StoredProcedure;

                    var sda = new SqlDataAdapter(cmd);

                    sda.Fill(dt);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return dt;
        }
    }
}