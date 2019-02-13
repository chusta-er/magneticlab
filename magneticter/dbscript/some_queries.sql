select exec_id, time_id, timer_secs, timer_nsecs, sys_time_secs, sys_time_usecs from timing;select time_id, num_samples, b_mean from magnetic_info;select time_id, time_ref, num_samples, latitute_mean, longitude_mean, altitude_mean from gps_info;select time_id, time_ref, stratum, last_offset, rms_offset from chrony_info;
select time_id, num_samples, b_mean, b_std, b_median, b_median_x, b_median_y, b_median_z from magnetic_info;
select time_id, num_samples, b_mean, b_std, b_median, b_median_x, b_median_y, b_median_z, b_min, b_min_x, b_min_y, b_min_z, b_max, b_max_x, b_max_y, b_max_z from magnetic_info;
select time_id, num_samples, b_x_mean, b_x_std, b_x_median, b_x_max, b_x_min from magnetic_info; select time_id, num_samples, b_y_mean, b_y_std, b_y_median, b_y_max, b_y_min from magnetic_info; select time_id, num_samples, b_z_mean, b_z_std, b_z_median, b_z_max, b_z_min from magnetic_info;
select time_id, num_samples, bat_min, bat_max, bat_med, sys_temp_min, sys_temp_max, sys_temp_med from magnetic_info;
select * from gps_info;
select * from chrony_info;

-- VISTA WEB (web_magnetic_info)
select t.sys_time_secs, ci.time_ref, m.b_mean, m.b_std, m.b_median, m.b_median_x, m.b_median_y, m.b_median_z, m.b_min, m.b_max
from timing t inner join magnetic_info m on t.time_id=m.time_id
inner join chrony_info ci on t.time_id=ci.time_id;
