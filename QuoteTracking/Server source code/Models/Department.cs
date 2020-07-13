using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace Models
{
    /// <summary>
    /// Department class
    /// Class holds load data to drop down list
    /// <users>
    ///     client
    ///     sql
    /// </users>
    /// </summary>
    public class Department
    {
        /// <summary>
        /// Department record id
        /// Database field: DepartmentRecordId 
        /// </summary>
        public int DepartmentRecordId { get; set; }

        /// <summary>
        /// Department Name
        /// Database field: DepartmentName
        /// </summary>
        public string DepartmentName { get; set; }

        /// <summary>
        /// To get all departments
        /// </summary>
        /// <param name="quoteConnection">Sql connection</param>
        /// <returns></returns>
        public static List<Department> Get(string quoteConnection)
        {
            var dt = new DataTable();

            try
            {
                dt = QuoteSql.GetRecord("spASQT_GetDepartments", quoteConnection);
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
        ///     List of department
        /// </returns>
        private static List<Department> ProcessList(DataTable dt)
        {
            List<Department> list;

            try
            {
                list = dt.AsEnumerable()
                        .Select(departments => new Department
                        {
                            DepartmentRecordId = departments.Field<int>("DepartmentRecordId"),
                            DepartmentName = departments.Field<string>("Department")
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