#include "pch.h"
#include "dbsave.h"
#include "config.h"

#include <postgresql/libpq-fe.h>
#include <syslog.h>

using namespace std;

// Function that performs the db insertion prelude:
void put_into_db( const std::string &uuid_string, const timeval &curr_time,
                  const timespec &raw_monot_time, const chrony_db_info_t &ci,
                  const vector<gps_db_info_t> &gi_c, const vector<magnetic_info_t> &mi_c )
{
    PGconn *conn = PQconnectdb("");

    ConnStatusType conn_stat = PQstatus(conn);

    if ( LOG_INFO <= get_log_level() ) // LOG_NOTICE?
       {
       cout << " == db insertion result  ==\n";
       switch ( conn_stat )
              {
              case CONNECTION_BAD:
                   cout  << " == CONNECTION_BAD       ==\n";
                   break;
              case CONNECTION_OK:
                   cout  << " == CONNECTION_OK        ==\n";
                   break;
              default:
                   cout  << " == (unknown state)      ==\n";
              }
       }

    if ( CONNECTION_OK != conn_stat ) {PQfinish(conn); return;}

/* ---------------------------------------------
    int median(vector<int> &v)
{
    size_t n = v.size() / 2;
    nth_element(v.begin(), v.begin()+n, v.end());
    return v[n];
}
   --------------------------------------------- */

    // B info:
    int b_mean = 0, b_std = 0,
        b_median = 0, b_median_x = 0, b_median_y = 0, b_median_z = 0,
        b_min = 0, b_min_x = 0, b_min_y = 0, b_min_z = 0,
        b_max = 0, b_max_x = 0, b_max_y = 0, b_max_z = 0,
        b_x_mean = 0, b_x_std = 0, b_x_median = 0, b_x_max = 0, b_x_min = 0,
        b_y_mean = 0, b_y_std = 0, b_y_median = 0, b_y_max = 0, b_y_min = 0,
        b_z_mean = 0, b_z_std = 0, b_z_median = 0, b_z_max = 0, b_z_min = 0;

    short sens_temp_min = 0, sens_temp_max = 0, sens_temp_med = 0,
          bat_min = 0, bat_max = 0, bat_med = 0,
          sys_temp_min = 0, sys_temp_max = 0, sys_temp_med = 0;

    // gps info:
    int time_ref_g = 0, num_g = gi_c.size();
    float latitute_mean = 0.0, latitute_std = 0.0, latitute_med = 0.0,
          latitute_min = 0.0, latitute_max = 0.0,
          longitude_mean = 0.0, longitude_std = 0.0, longitude_med = 0.0,
          longitude_min = 0.0, longitude_max = 0.0,
          altitude_mean = 0.0, altitude_std = 0.0, altitude_med = 0.0,
          altitude_min = 0.0, altitude_max = 0.0;

    // chrony info:
    int time_ref_c = 0, stratum = 0;
    double last_offset = 0.0, rms_offset = 0.0;

    string cmd =
    "START TRANSACTION; SELECT insert_full_register('" +

    // execution uuid:
    uuid_string + "'," +

    // timing info:
    to_string( raw_monot_time.tv_sec ) + "," +
    to_string( raw_monot_time.tv_nsec ) + "," +
    to_string( curr_time.tv_sec ) + "," +
    to_string( curr_time.tv_usec ) + "," +

    // magnetic info:
    (mi_c.size() != 0 ?
                      to_string( mi_c.size() ) + "," +
                      to_string( b_mean ) + "," +
                      to_string( b_std ) + "," +
                      to_string( b_median ) + "," +
                      to_string( b_median_x ) + "," +
                      to_string( b_median_y ) + "," +
                      to_string( b_median_z ) + "," +
                      to_string( b_min ) + "," +
                      to_string( b_min_x ) + "," +
                      to_string( b_min_y ) + "," +
                      to_string( b_min_z ) + "," +
                      to_string( b_max ) + "," +
                      to_string( b_max_x ) + "," +
                      to_string( b_max_y ) + "," +
                      to_string( b_max_z ) + "," +
                      to_string( b_x_mean ) + "," +
                      to_string( b_x_std ) + "," +
                      to_string( b_x_median ) + "," +
                      to_string( b_x_max ) + "," +
                      to_string( b_x_min ) + "," +
                      to_string( b_y_mean ) + "," +
                      to_string( b_y_std ) + "," +
                      to_string( b_y_median ) + "," +
                      to_string( b_y_max ) + "," +
                      to_string( b_y_min ) + "," +
                      to_string( b_z_mean ) + "," +
                      to_string( b_z_std ) + "," +
                      to_string( b_z_median ) + "," +
                      to_string( b_z_max ) + "," +
                      to_string( b_z_min ) + "," +
                      to_string( sens_temp_min ) + "::int2," +
                      to_string( sens_temp_max ) + "::int2," +
                      to_string( sens_temp_med ) + "::int2," +
                      to_string( bat_min ) + "::int2," +
                      to_string( bat_max ) + "::int2," +
                      to_string( bat_med ) + "::int2," +
                      to_string( sys_temp_min ) + "::int2," +
                      to_string( sys_temp_max ) + "::int2," +
                      to_string( sys_temp_med ) + "::int2,"
                      :
                      string("NULL, NULL, "
                             "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                             "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                             "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                             "NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "
                             "NULL, NULL, NULL, NULL, NULL, ")
    ) +

    // gps info:
    (time_ref_g != 0 ?
                     to_string( time_ref_g ) + "," +
                     to_string( num_g ) + "," +
                     to_string( latitute_mean ) + "::float4," +
                     to_string( latitute_std ) + "::float4," +
                     to_string( latitute_med ) + "::float4," +
                     to_string( latitute_min ) + "::float4," +
                     to_string( latitute_max ) + "::float4," +
                     to_string( longitude_mean ) + "::float4," +
                     to_string( longitude_std ) + "::float4," +
                     to_string( longitude_med ) + "::float4," +
                     to_string( longitude_min ) + "::float4," +
                     to_string( longitude_max ) + "::float4," +
                     to_string( altitude_mean ) + "::float4," +
                     to_string( altitude_std ) + "::float4," +
                     to_string( altitude_med ) + "::float4," +
                     to_string( altitude_min ) + "::float4," +
                     to_string( altitude_max ) + "::float4,"
                     :
                     string("NULL, NULL, "
                            "NULL, NULL, NULL, NULL, "
                            "NULL, NULL, NULL, NULL, "
                            "NULL, NULL, NULL, NULL, "
                            "NULL, NULL, NULL, ")
    ) +
    // chrony info:
    (time_ref_c != 0 ?
                     to_string( time_ref_c ) + "," +
                     to_string( stratum ) + "," +
                     to_string( last_offset ) + "::float8," +
                     to_string( rms_offset ) + "::float8"
                     :
                     string("NULL, NULL, NULL, NULL")
    ) +

    ");COMMIT;";

    PGresult *insert_result = PQexec(conn, cmd.c_str());
    ExecStatusType status_insert = PQresultStatus(insert_result);

    if ( LOG_INFO <= get_log_level() ) // LOG_NOTICE?
       {
       switch ( status_insert )
              {
              case PGRES_COMMAND_OK:
                   cout  << " == PGRES_COMMAND_OK     ==\n";
                   break;
              case PGRES_NONFATAL_ERROR:
                   cout  << " == PGRES_NONFATAL_ERROR ==\n";
                   break;
              case PGRES_FATAL_ERROR:
                   cout  << " == PGRES_FATAL_ERROR    ==\n";
                   break;
              default:
                   cout  << " == (unknown insert res) ==\n";
              }
       }

    if ( status_insert != PGRES_COMMAND_OK )
       {
       cerr << PQresStatus(status_insert) << endl;
       char *err_msg = PQresultErrorMessage(insert_result);
       if ( err_msg ) cerr << err_msg << endl;
       }

    // Terminate connection and liberate its resources:
    PQfinish(conn);

    if ( LOG_INFO <= get_log_level() )
       cout << " ==========================\n";
}
