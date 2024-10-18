import React, { useState, useEffect } from 'react';
import { Battery, Wifi } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const arrayBufferToNumber = (buffer, expectedLength) => {
  if (!buffer || !(buffer instanceof ArrayBuffer)) {
    return 999;
  }
  const view = new DataView(buffer);
  if (buffer.byteLength >= expectedLength) {
    if (expectedLength === 1) {
      return view.getUint8(0);
    } else if (expectedLength === 2) {
      return view.getUint16(0);
    }
  }
  return 999;
};

interface AGVProps {
  agvNumber: number;
}

const TrafficZone: React.FC<{ zone: string; agvNumber: number; agvData: any }> = ({ zone, agvNumber, agvData }) => {
  const request = arrayBufferToNumber(agvData[`Traffic.Zone${zone}.Request`], 1);
  const busy = arrayBufferToNumber(agvData[`Traffic.Zone${zone}.Busy`], 1);

  return (
    <div className="traffic-zone">
      <div className="zone-title">Zone {zone}</div>
      <div className="zone-content">
        <div className="zone-item">
          <div className="zone-label">Request</div>
          <div className="zone-value request">{request}</div>
        </div>
        <div className="zone-item">
          <div className="zone-label">Busy</div>
          <div className="zone-value busy">{busy}</div>
        </div>
      </div>
    </div>
  );
};

const locationMap: { [key: number]: string } = {
  12: "WINDSHIELD",
  14: "ENGINE KSK",
  15: "BODY KSK",
  22: "ATLAS HEADLINER",
  31: "FRONT EXHUAST",
  32: "ATLAS FUEL TANK",
  36: "DUAL EXHUST",
  34: "FRONT AXLE",
  35: "REAR AXLE",
  6: "TOOL KIT",
  7: "STEERING WHEEL",
  26: "SPARE TIRE",
  23: "WHEEL & TIRE",
  37: "ATLAS SPOILER",
  5: "PGD",
  9: "LH ROOF MOLDING",
  2: "RH ROOF MOLDING",
  3: "CURTAIN AIRBAGS",
  8: "LH CORNER MOD",
  13: "MQB DAMPENING"
};

interface ErrorCode {
  message: string;
  type: 'informative' | 'warning' | 'machine-stops' | 'none';
}

const errorCodes: { [key: number]: ErrorCode } = {
  0: { message: "AGV without Anomalies", type: "informative" },
  1: { message: "Safety switch activated", type: "machine-stops" },
  2: { message: "Reset pending", type: "machine-stops" },
  3: { message: "Error in multiple drives", type: "machine-stops" },
  4: { message: "SAFETY ZONE - Reset pending", type: "machine-stops" },
  5: { message: "SAFETY ZONE", type: "machine-stops" },
  6: { message: "Battery level very low", type: "machine-stops" },
  7: { message: "PLC error", type: "machine-stops" },
  8: { message: "WARNING ZONE - Reduced speed", type: "warning" },
  9: { message: "No communication with RFID", type: "machine-stops" },
  10: { message: "Unexpected point exists in the table", type: "informative" },
  11: { message: "Unexpected point direction changed", type: "informative" },
  12: { message: "Unexpected point does not exist in the table", type: "informative" },
  13: { message: "Localization system not configured", type: "machine-stops" },
  14: { message: "No data received from remote control in time", type: "warning" },
  15: { message: "Incorrect data from remote control", type: "warning" },
  16: { message: "Wireless control emergency stop activated", type: "warning" },
  17: { message: "Circuit values not loaded", type: "informative" },
  18: { message: "Routing table: Point with multiple IDs", type: "warning" },
  19: { message: "Routing table: No next point", type: "warning" },
  20: { message: "Undefined error", type: "informative" },
  21: { message: "Localization system lost", type: "machine-stops" },
  22: { message: "Incorrect guide selection value", type: "warning" },
  23: { message: "Routing table: Segment limit exceeded", type: "warning" },
  24: { message: "Point does not belong to the route", type: "warning" },
  25: { message: "Maximum time for operations block 1", type: "machine-stops" },
  26: { message: "Maximum time for operations block 2", type: "machine-stops" },
  27: { message: "Anomaly point", type: "machine-stops" },
  28: { message: "Unexpected point exists in TDT", type: "warning" },
  29: { message: "Anomaly in the elevation system", type: "machine-stops" },
  30: { message: "Routing table: Current route not defined", type: "warning" },
  31: { message: "Routing table: Current point not defined", type: "warning" },
  32: { message: "Undefined error", type: "informative" },
  33: { message: "Error in guide detection", type: "warning" },
  34: { message: "Error in magnetic sensors", type: "machine-stops" },
  35: { message: "Error in guide search", type: "machine-stops" },
  36: { message: "Blind guidance distance exceeded", type: "machine-stops" },
  37: { message: "Anomaly in CAN bus", type: "machine-stops" },
  38: { message: "Maximum time for precise stop", type: "machine-stops" },
  39: { message: "Maximum time for operations block 3", type: "machine-stops" },
  40: { message: "No communication with RFID", type: "machine-stops" },
  41: { message: "Error in coupling position", type: "machine-stops" },
  42: { message: "Maximum time for coupling movement", type: "machine-stops" },
  43: { message: "Error in battery recharge position", type: "machine-stops" },
  44: { message: "Maximum time for battery recharge", type: "machine-stops" },
  45: { message: "Battery recharge error", type: "machine-stops" },
  46: { message: "Maximum traction exceeded", type: "machine-stops" },
  47: { message: "Battery recharge error: No current detected", type: "warning" },
  48: { message: "Maximum time for half turn exceeded", type: "machine-stops" },
  49: { message: "Battery recharge error: No current detected", type: "warning" },
  50: { message: "Laser dirty", type: "warning" },
  51: { message: "SAFETY ZONE: Curtain laser", type: "machine-stops" },
  52: { message: "Undefined error", type: "informative" },
  53: { message: "Drive in auto-reset process", type: "informative" },
  54: { message: "Undefined error", type: "informative" },
  55: { message: "Maximum movement percentage exceeded", type: "machine-stops" },
  56: { message: "AGV stuck", type: "machine-stops" },
  57: { message: "Some encoder has not refreshed", type: "machine-stops" },
  58: { message: "Some encoder is not counting", type: "machine-stops" },
  59: { message: "Low battery level", type: "warning" },
  60: { message: "Error in front left drive", type: "machine-stops" },
  61: { message: "Error in front right drive", type: "machine-stops" },
  62: { message: "Error in rear left drive", type: "machine-stops" },
  63: { message: "Error in rear right drive", type: "machine-stops" },
  64: { message: "Undefined error", type: "machine-stops" },
  65: { message: "No communication with central control", type: "machine-stops" },
  66: { message: "Undefined error", type: "informative" },
  67: { message: "Undefined error", type: "informative" },
  68: { message: "Undefined error", type: "informative" },
  69: { message: "Undefined error", type: "informative" },
  70: { message: "Undefined error", type: "informative" },
  71: { message: "Undefined error", type: "informative" },
  72: { message: "Undefined error", type: "informative" },
  73: { message: "Undefined error", type: "informative" },
  74: { message: "Undefined error", type: "informative" },
  75: { message: "Undefined error", type: "informative" },
  76: { message: "Undefined error", type: "informative" },
  77: { message: "Tag reading canceled", type: "informative" },
  78: { message: "Port in programming mode", type: "informative" },
  79: { message: "End of route", type: "informative" },
  80: { message: "Undefined error", type: "informative" },
  81: { message: "Waiting for conditions: Waiting for PLC input", type: "informative" },
  82: { message: "Waiting for traffic controller permissions", type: "informative" },
  83: { message: "Waiting for conditions", type: "informative" },
  84: { message: "Waiting for conditions", type: "informative" },
  85: { message: "Waiting for conditions", type: "informative" },
  86: { message: "Waiting for conditions", type: "informative" },
  87: { message: "Waiting for conditions", type: "informative" },
  88: { message: "Waiting for conditions", type: "informative" },
  89: { message: "Waiting for conditions", type: "informative" },
  90: { message: "Recharging battery", type: "informative" },
  91: { message: "Battery recharge finished", type: "informative" },
  92: { message: "Undefined error", type: "machine-stops" },
  93: { message: "Waiting for conditions", type: "informative" },
  94: { message: "Waiting for conditions", type: "informative" },
  95: { message: "Slow advance until signal", type: "informative" },
  96: { message: "Recharging battery", type: "informative" },
  97: { message: "No communication with central control", type: "warning" },
  98: { message: "Undefined error", type: "informative" },
  99: { message: "Communication error PLC-Screen", type: "warning" },
  100: { message: "Undefined error", type: "informative" },
  101: { message: "Safety error 1: Check manual", type: "machine-stops" },
  102: { message: "Speed measurement error", type: "machine-stops" },
  103: { message: "Safety error 3: Check manual", type: "machine-stops" },
  104: { message: "No movement detected", type: "machine-stops" },
  105: { message: "Error in laser field selection inputs", type: "machine-stops" },
  106: { message: "Safety error 6: Check manual", type: "machine-stops" },
  107: { message: "Speed out of limits", type: "machine-stops" },
  108: { message: "Safety error 8: Check manual", type: "machine-stops" },
  109: { message: "EDM error", type: "machine-stops" },
  110: { message: "Safety error 10: Check manual", type: "machine-stops" },
  111: { message: "Safety error 11: Check manual", type: "machine-stops" },
  112: { message: "Safety error 12: Check manual", type: "machine-stops" },
  113: { message: "Not resettable", type: "machine-stops" },
  114: { message: "Laser OSSD error: Not resettable", type: "machine-stops" },
  115: { message: "Laser OSSD error: Not resettable", type: "machine-stops" },
  116: { message: "Movement detection at rest", type: "machine-stops" },
  117: { message: "Undefined error", type: "machine-stops" },
  118: { message: "Undefined error", type: "machine-stops" },
  119: { message: "Indeterminate error", type: "machine-stops" },
  120: { message: "CAN error with node 20", type: "machine-stops" },
  121: { message: "CAN error with node 21", type: "warning" },
  122: { message: "CAN error with node 22", type: "warning" },
  123: { message: "CAN error with node 23", type: "warning" },
  124: { message: "CAN error with node 24", type: "warning" },
  125: { message: "CAN error with node 25", type: "warning" },
  126: { message: "CAN error with node 26", type: "warning" },
  127: { message: "CAN error with node 27", type: "warning" },
  128: { message: "CAN error with node 28", type: "warning" },
  129: { message: "CAN error with node 8", type: "machine-stops" },
  130: { message: "CAN error with node 9", type: "machine-stops" },
  131: { message: "CAN error with node 10", type: "machine-stops" },
  132: { message: "CAN error with node 11", type: "machine-stops" },
  133: { message: "CAN error with node 12", type: "machine-stops" },
  134: { message: "CAN error with node XX", type: "machine-stops" },
  135: { message: "CAN error with node XX", type: "machine-stops" },
  136: { message: "CAN error with node XX", type: "machine-stops" },
  137: { message: "CAN error with node XX", type: "warning" },
  138: { message: "CAN error with node 5", type: "warning" },
  139: { message: "CAN error with node XX", type: "warning" },
  140: { message: "Configurable anomaly 1: Check manual", type: "warning" },
  141: { message: "Uncalibrated steering encoder", type: "machine-stops" },
  142: { message: "Anomaly: Power supply system", type: "warning" },
  143: { message: "Configurable anomaly 4: Check manual", type: "warning" },
  144: { message: "Configurable anomaly 5: Check manual", type: "warning" },
  145: { message: "Configurable anomaly 6: Check manual", type: "warning" },
  146: { message: "Configurable anomaly 7: Check manual", type: "warning" },
  147: { message: "Configurable anomaly 8: Check manual", type: "warning" },
  148: { message: "Configurable anomaly 9: Check manual", type: "warning" },
  149: { message: "Configurable anomaly 10: Check manual", type: "warning" },
  150: { message: "Configurable anomaly 11: Check manual", type: "warning" },
  151: { message: "Configurable anomaly 12: Check manual", type: "warning" },
  152: { message: "No communication with MTX (Datalogger)", type: "warning" },
  153: { message: "Configurable anomaly 14: Check manual", type: "machine-stops" },
  154: { message: "Configurable anomaly 15: Check manual", type: "machine-stops" },
  155: { message: "Configurable anomaly 16: Check manual", type: "informative" },
  156: { message: "Undefined error", type: "informative" },
  157: { message: "Undefined error", type: "informative" },
  158: { message: "Undefined error", type: "informative" },
  159: { message: "Undefined error", type: "informative" },
  160: { message: "Undefined error", type: "informative" },
  161: { message: "Undefined error", type: "informative" },
  162: { message: "Undefined error", type: "informative" },
  163: { message: "Undefined error", type: "informative" },
  164: { message: "Undefined error", type: "informative" },
  165: { message: "Undefined error", type: "informative" },
  166: { message: "Undefined error", type: "informative" },
  167: { message: "Undefined error", type: "informative" },
  168: { message: "Undefined error", type: "informative" },
  169: { message: "Undefined error", type: "informative" },
  170: { message: "Undefined error", type: "informative" },
  171: { message: "Undefined error", type: "informative" },
  172: { message: "Undefined error", type: "informative" },
  173: { message: "Undefined error", type: "informative" },
  174: { message: "Undefined error", type: "informative" },
  175: { message: "Undefined error", type: "informative" },
  176: { message: "Undefined error", type: "informative" },
  177: { message: "Undefined error", type: "informative" },
  178: { message: "Undefined  error", type: "informative" },
  179: { message: "Undefined error", type: "informative" },
  180: { message: "Manual mode", type: "informative" },
  181: { message: "Semi-manual mode", type: "informative" },
};


const AGVPanel: React.FC<AGVProps> = ({ agvNumber }) => {
  const [agvData, setAgvData] = useState(null);

  useEffect(() => {
    socket.on('agvData', (data) => {
      const filteredData = data.find((agv) => agv['Communication.ID'] === agvNumber);
      setAgvData(filteredData);
    });

    return () => {
      socket.off('agvData');
    };
  }, [agvNumber]);

  const isOnlyCommunicationIDPresent = agvData && agvData['Communication.ID'] && 
    (!agvData['Communication.Status'] && 
     !agvData['LayoutPosition.Route'] && 
     !agvData['LayoutPosition.Point'] && 
     !agvData['Traffic.ZoneA.Request'] && 
     !agvData['Traffic.ZoneA.Busy'] && 
     !agvData['Traffic.ZoneB.Request'] && 
     !agvData['Traffic.ZoneB.Busy'] && 
     !agvData['Battery.Percentage'] && 
     !agvData['ScreenInfo'] && 
     !agvData['AGVEnable']);

  if (isOnlyCommunicationIDPresent) {
    return null;
  }

  if (!agvData) {
    return null;
  }

  const batteryPercentage = arrayBufferToNumber(agvData['Battery.Percentage'], 2);
  const agvEnabled = agvData['AGVEnable'];
  const wifiStatus = agvData['Communication.Status'];
  const screenInfo = arrayBufferToNumber(agvData['ScreenInfo'], 2);
  const route = arrayBufferToNumber(agvData['LayoutPosition.Route'], 2);
  const point = arrayBufferToNumber(agvData['LayoutPosition.Point'], 2);
  const communicationId = agvData['Communication.ID'];

  const getBatteryColor = (percentage: number) => {
    if (percentage > 66) return 'battery-high';
    if (percentage > 33) return 'battery-medium';
    return 'battery-low';
  };

  const locationMessage = locationMap[route] || '';

  const errorCode = errorCodes[screenInfo] || { message: "", type: "none"};

  return (
    <div className="agv-panel">
      <div className="panel-header">
        <div className="header-left">
          <div className="id-agv">
            <div className="id-labels">
              <span className="label">C_ID</span>
              <span className="label">ID_AGV</span>
            </div>
            <div className="id-values">
              <div className="communication-id">
                <div className="comm-id-value">{communicationId}</div>
              </div>
              <div className={`value ${agvEnabled ? 'enabled' : 'disabled'}`}>
                {agvData['ID_AGV']}
              </div>
            </div>
          </div>
          <div className="battery">
            <div className="label">Battery</div>
            <div className={`value ${getBatteryColor(batteryPercentage)}`}>
              <Battery className="battery-icon" />
              <span>{batteryPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="screen-info">
            <div className="label">ScreenInfo</div>
            <div className="value">{screenInfo}</div>
          </div>
          <div className="communication">
            <div className="label">Communication</div>
            <div className={`value ${wifiStatus === 1 ? 'connected' : 'disconnected'}`}>
              <Wifi className="wifi-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className={`location ${locationMessage ? '' : 'hidden'}`}>
        {locationMessage}
      </div>

      <div className="panel-body">
        <div className="route-point">
          <div className="route">
            <div className="label">Route</div>
            <div className="value">{route}</div>
          </div>
          <div className="point">
            <div className="label">Point</div>
            <div className="value">{point}</div>
          </div>
        </div>

        {errorCode.type !== "none" && (
          <div className={`error ${errorCode.type}`}>
            {errorCode.message}
          </div>
        )}

        <div className="traffic-zones">
          <TrafficZone zone="A" agvNumber={agvNumber} agvData={agvData} />
          <TrafficZone zone="B" agvNumber={agvNumber} agvData={agvData} />
        </div>
      </div>
    </div>
  );
};

export default AGVPanel;