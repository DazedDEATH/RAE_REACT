import React from 'react'
import { Battery, Wifi } from 'lucide-react'

// Mock function to simulate agv_db.query_variable
const queryVariable = (variable: string, agvNumber: number) => {
  // This function would be replaced with your actual data fetching logic
  if (variable.startsWith('Traffic')) {
    return Math.floor(Math.random() * 2) // Returns 0 or 1 for traffic data
  }
  if (variable === 'Battery.Percentage') {
    return Math.floor(Math.random() * 101) // Returns 0-100 for battery percentage
  }
  return Math.floor(Math.random() * 100)
}

interface AGVProps {
  agvNumber: number
}

const TrafficZone: React.FC<{ zone: string; agvNumber: number }> = ({ zone, agvNumber }) => {
  const request = queryVariable(`Traffic.Zone${zone}.Request`, agvNumber)
  const busy = queryVariable(`Traffic.Zone${zone}.Busy`, agvNumber)

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
  )
}

const AGVPanel: React.FC<AGVProps> = ({ agvNumber }) => {
  const batteryPercentage = queryVariable('Battery.Percentage', agvNumber)
  const agvEnabled = queryVariable('AGVEnable', agvNumber) > 50
  const wifiStatus = queryVariable('Communication.Status', agvNumber) > 50
  const screenInfo = queryVariable('ScreenInfo', agvNumber)
  
  const getBatteryColor = (percentage: number) => {
    if (percentage > 66) return 'battery-high'
    if (percentage > 33) return 'battery-medium'
    return 'battery-low'
  }

  return (
    <div className="agv-panel">
      <div className="panel-header">
        <div className="header-left">
          <div className="id-agv">
            <div className="label">ID_AGV</div>
            <div className={`value ${agvEnabled ? 'enabled' : 'disabled'}`}>
              {queryVariable('ID_AGV', agvNumber)}
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
            <div className={`value ${wifiStatus ? 'connected' : 'disconnected'}`}>
              <Wifi className="wifi-icon" />
            </div>
          </div>
        </div>
      </div>
      <div className="panel-body">
        <div className="route-point">
          <div className="route">
            <div className="label">Route</div>
            <div className="value">{queryVariable('LayoutPosition.Route', agvNumber)}</div>
          </div>
          <div className="point">
            <div className="label">Point</div>
            <div className="value">{queryVariable('LayoutPosition.Point', agvNumber)}</div>
          </div>
        </div>
        <div className={`change-route ${screenInfo === 19 ? '' : 'hidden'}`}>
          Change route
        </div>
        <div className="traffic-zones">
          <TrafficZone zone="A" agvNumber={agvNumber} />
          <TrafficZone zone="B" agvNumber={agvNumber} />
        </div>
      </div>
    </div>
  )
}

export default AGVPanel