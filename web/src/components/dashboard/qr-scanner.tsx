'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const isMountedRef = useRef(true)
  const isStoppingRef = useRef(false)
  const hasScannedRef = useRef(false)

  const stopScanning = useCallback(async () => {
    if (isStoppingRef.current) return
    if (!scannerRef.current) {
      setIsScanning(false)
      return
    }

    isStoppingRef.current = true

    try {
      const scanner = scannerRef.current
      scannerRef.current = null

      // Must stop before clearing
      if (scanner.isScanning) {
        await scanner.stop()
      }
      // Only clear after stop completes
      try {
        await scanner.clear()
      } catch {
        // Clear can fail if already cleaned - that's ok
      }
    } catch (err) {
      // Ignore errors during cleanup - component may already be unmounted
      console.log('Scanner cleanup:', err)
    } finally {
      isStoppingRef.current = false
      if (isMountedRef.current) {
        setIsScanning(false)
      }
    }
  }, [])

  const startScanning = async () => {
    // Don't start if already scanning or stopping
    if (scannerRef.current || isStoppingRef.current) return

    // Reset scanned flag
    hasScannedRef.current = false

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
        async (decodedText) => {
          // Prevent multiple scan callbacks
          if (hasScannedRef.current) return
          hasScannedRef.current = true

          // Stop scanner before calling onScan
          await stopScanning()

          if (isMountedRef.current) {
            onScan(decodedText)
          }
        },
        () => {
          // QR code not found - this is fine, keep scanning
        }
      )

      if (isMountedRef.current) {
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Scanner error:', err)
      if (isMountedRef.current) {
        setError('Could not access camera. Please ensure camera permissions are granted.')
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      // Stop scanner on unmount
      const scanner = scannerRef.current
      if (scanner) {
        scannerRef.current = null
        // Chain stop then clear - must wait for stop before clearing
        ;(async () => {
          try {
            if (scanner.isScanning) {
              await scanner.stop()
            }
          } catch {
            // Ignore stop errors
          }
          try {
            scanner.clear()
          } catch {
            // Ignore clear errors
          }
        })()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Scanner container - keep it empty to avoid DOM conflicts with html5-qrcode */}
      <div className="relative w-full aspect-square">
        <div
          id="qr-reader"
          className="w-full h-full bg-gray-100 rounded-lg overflow-hidden"
        />

        {/* Placeholder overlay - positioned absolutely to avoid DOM conflicts */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
