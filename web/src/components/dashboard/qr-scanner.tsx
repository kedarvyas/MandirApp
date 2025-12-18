'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startScanning = async () => {
    if (!containerRef.current) return

    try {
      setError(null)
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
        },
        () => {
          // QR code not found - this is fine, keep scanning
        }
      )

      setIsScanning(true)
    } catch (err) {
      console.error('Scanner error:', err)
      setError('Could not access camera. Please ensure camera permissions are granted.')
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden"
      >
        {!isScanning && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Camera preview will appear here</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Button
        onClick={isScanning ? stopScanning : startScanning}
        className="w-full"
        variant={isScanning ? 'destructive' : 'default'}
      >
        {isScanning ? (
          <>
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Scanner
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Start Scanner
          </>
        )}
      </Button>
    </div>
  )
}
