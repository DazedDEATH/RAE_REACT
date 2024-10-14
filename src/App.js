import React from 'react'
import AGVPanel from './agv-control-panel.tsx'
import './agv-control-panel.css'

function App() {
  const numberOfAGVs = 3 // You can change this to display more AGVs

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">AGV Control Panel</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(numberOfAGVs)].map((_, index) => (
            <AGVPanel key={index + 1} agvNumber={index + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App