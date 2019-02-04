select exec_id, time_id, timer_secs, timer_nsecs, sys_time_secs, sys_time_usecs from timing;
select time_id, num_samples, b_mean from magnetic_info;
select time_id, time_ref, num_samples, latitute_mean, longitude_mean, altitude_mean from gps_info;
select time_id, time_ref, stratum, last_offset, rms_offset from chrony_info;
