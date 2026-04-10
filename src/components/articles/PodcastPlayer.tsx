import React, { useState, useRef, useEffect } from 'react'
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa'

interface PodcastPlayerProps {
  src: string
  title: string
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({ src, title }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progressPercent = 
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progressPercent)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = 
        (Number(e.target.value) / 100) * audioRef.current.duration
      audioRef.current.currentTime = seekTime
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="podcast-player">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="podcast-info">
        <h3>{title}</h3>
      </div>
      
      <div className="podcast-controls">
        <button 
          onClick={togglePlayPause} 
          className="play-pause-btn"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        
        <input 
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="progress-bar"
        />
        
        <div className="time-display">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>/ {formatTime(duration)}</span>
        </div>
        
        <button 
          onClick={toggleMute} 
          className="mute-btn"
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </div>
    </div>
  )
}
