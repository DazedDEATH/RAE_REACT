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
    <div className="bg-gray-700 p-2 rounded-lg">
      <div className="text-sm font-semibold mb-1 text-center text-gray-300">Zone {zone}</div>
      <div className="flex justify-center items-center space-x-4">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-400">Request</div>
          <div className="text-lg font-bold text-blue-400">{request}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-400">Busy</div>
          <div className="text-lg font-bold text-red-400">{busy}</div>
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
    if (percentage > 66) return 'text-green-500'
    if (percentage > 33) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="col-span-2 sm:col-span-1 flex flex-col items-center space-y-2">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">ID_AGV</div>
            <div className={`text-xl font-bold px-2 py-1 rounded ${agvEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {queryVariable('ID_AGV', agvNumber)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Battery</div>
            <div className="flex items-center justify-center space-x-1">
              <Battery className={`w-5 h-5 ${getBatteryColor(batteryPercentage)}`} />
              <span className="text-lg font-bold text-white">{batteryPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-col items-center space-y-2">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">ScreenInfo</div>
            <div className="bg-gray-700 px-2 py-1 rounded text-sm text-white">
              {queryVariable('ScreenInfo', agvNumber)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Communication</div>
            <div className="flex justify-center">
              <Wifi className={`w-5 h-5 ${wifiStatus ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-center">
          <div className="text-xs font-semibold mb-1 text-gray-300">Route</div>
          <div className="bg-blue-600 px-2 py-1 rounded text-sm text-white">
            {queryVariable('LayoutPosition.Route', agvNumber)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-semibold mb-1 text-gray-300">Point</div>
          <div className="bg-blue-600 px-2 py-1 rounded text-sm text-white">
            {queryVariable('LayoutPosition.Point', agvNumber)}
          </div>
        </div>
      </div>
      <div className={`bg-yellow-500 px-2 py-1 rounded text-center text-sm mb-2 ${screenInfo === 19 ? '' : 'hidden'}`}>
        Change route
      </div>
      <div className="grid grid-cols-2 gap-2">
        <TrafficZone zone="A" agvNumber={agvNumber} />
        <TrafficZone zone="B" agvNumber={agvNumber} />
      </div>
    </div>
  )
}

export default AGVPanel