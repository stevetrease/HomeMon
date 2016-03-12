import netsnmp
# import time
import datetime
import os 
import sys

sys.path.append('/usr/local/lib/python2.7/site-packages')
import mosquitto


client_uniq = str(os.getpid())
mqttc = mosquitto.Mosquitto(client_uniq)


mqttc.connect("127.0.0.1", 1883, 60)



session = netsnmp.Session( DestHost='192.168.1.1', Version=2, Community='fa1con')
vars1 = netsnmp.VarList( netsnmp.Varbind('.1.3.6.1.2.1.2.2.1.16.6') )
vars2 = netsnmp.VarList( netsnmp.Varbind('.1.3.6.1.2.1.2.2.1.10.6') )

data = [ 0, 0, 0, 0, 0 ]
data_up = [ 0, 0, 0, 0, 0 ]
data_down = [ 0, 0, 0, 0, 0 ]

bytes_up_old = int(session.get(vars1)[0])
bytes_down_old = int(session.get(vars2)[0])

oldtime = datetime.datetime.now()

while mqttc.loop() == 0:
	
	bytes_up_new = int(session.get(vars1)[0])
	bytes_down_new = int(session.get(vars2)[0])
	bytes_up_diff = bytes_up_new - bytes_up_old
	bytes_down_diff = bytes_down_new - bytes_down_old

	newtime = datetime.datetime.now()
	timediff = newtime - oldtime

	mbps_total = round((bytes_down_diff + bytes_up_diff) * 8.0 / 1000000.0 / timediff.total_seconds() , 3)
	mbps_down = round((bytes_down_diff) * 8.0 / 1000000.0 / timediff.total_seconds(), 3)
	mbps_up = round((bytes_up_diff) * 8.0 / 1000000.0 / timediff.total_seconds(), 3)

	mqttc.publish("sensors/snmp/router/up", str(bytes_up_new))
	mqttc.publish("sensors/snmp/router/down", str(bytes_down_new))
	mqttc.publish("sensors/snmp/router/total", str(bytes_down_new + bytes_down_new))

	# print current bandwidth on bottom line of LCD
	mqttc.publish("LCD/1/line/1", "{:5.2f}".format(mbps_total))

	bytes_up_old = bytes_up_new
	bytes_down_old = bytes_down_new
	oldtime = newtime
