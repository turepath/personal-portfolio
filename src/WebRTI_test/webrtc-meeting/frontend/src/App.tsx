import { useState } from 'react'
import JoinForm from './components/JoinForm'
import MeetingRoom from './components/MeetingRoom'
import './styles/App.css'

function App() {
  const [meetingState, setMeetingState] = useState({
    isInMeeting: false,
    username: '',
    roomId: ''
  })

  const handleJoinMeeting = (data: { username: string; roomId: string }) => {
    setMeetingState({
      isInMeeting: true,
      username: data.username,
      roomId: data.roomId
    })
  }

  const handleLeaveMeeting = () => {
    setMeetingState({
      isInMeeting: false,
      username: '',
      roomId: ''
    })
  }

  return (
    <div className="app">
      {!meetingState.isInMeeting ? (
        <JoinForm onJoin={handleJoinMeeting} />
      ) : (
        <MeetingRoom
          username={meetingState.username}
          roomId={meetingState.roomId}
          onLeave={handleLeaveMeeting}
        />
      )}
    </div>
  )
}

export default App
