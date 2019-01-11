#include "pch.h"
#include "dbsave.h"

#include <postgresql/libpq-fe.h>

using namespace std;

// Function that performs the db insertion prelude:
void put_into_db( const uuid_t &uuid, const timeval &curr_time, const timespec &raw_monot_time,
                  const chrony_db_info_t &ci,
                  const vector<gps_db_info_t> &gi_c, const vector<magnetic_info_t> &mi_c )
{
    cout << " == db connection result ==\n";
    PGconn *conn = PQconnectdb("");

    switch ( PQstatus(conn) )
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

    PQfinish(conn);
    cout << " ==========================\n";
}
