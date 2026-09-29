import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { io } from 'socket.io-client';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function VideoCall() {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const room = searchParams.get('room');
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('register', user._id);
    socketRef.current.emit('join_room', room);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    }).catch(err => {
      toast.error('Camera/Microphone access denied');
    });

    socketRef.current.on('webrtc_offer', ({ from, offer }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(offer);
    });

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      socketRef.current.disconnect();
    };
  }, [room, user._id]);

  const callUser = (idToCall) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      socketRef.current.emit('webrtc_offer', { to: idToCall, offer: data });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    socketRef.current.on('webrtc_answer', ({ from, answer }) => {
      setCallAccepted(true);
      peer.signal(answer);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      socketRef.current.emit('webrtc_answer', { to: caller, answer: data });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    navigate(-1);
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = muted;
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = videoOff;
      setVideoOff(!videoOff);
    }
  };

  return (
    <div className="fade-in max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-elevated flex justify-between items-center z-10">
        <h2 className="font-bold flex items-center gap-2"><FaVideo className="text-primary-light" /> Consultation Room</h2>
        <span className="badge badge-gray font-mono">{room?.split('-')[0]}</span>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center p-4">
        {/* Remote Video (Full screen) */}
        {callAccepted && !callEnded ? (
          <video playsInline ref={userVideo} autoPlay className="w-full h-full object-contain" />
        ) : (
          <div className="text-text-muted flex flex-col items-center">
            <FaVideo className="text-6xl mb-4 opacity-20" />
            <p className="text-lg">Waiting for other participant to join...</p>
            {/* Simulation button for the expert to "call" the farmer if farmer is online */}
            {user.role === 'expert' && !receivingCall && !callAccepted && (
              <p className="text-sm mt-4 text-primary-light">The farmer will be notified when you join the room.</p>
            )}
          </div>
        )}

        {/* Local Video (PiP) */}
        {stream && (
          <div className="absolute bottom-6 right-6 w-48 h-36 bg-bg-elevated rounded-lg overflow-hidden border-2 border-border shadow-lg z-20">
            <video playsInline muted ref={myVideo} autoPlay className={`w-full h-full object-cover ${videoOff ? 'hidden' : ''}`} />
            {videoOff && <div className="w-full h-full flex items-center justify-center bg-bg-base text-text-muted"><FaVideoSlash size={32} /></div>}
          </div>
        )}

        {/* Incoming Call Overlay */}
        {receivingCall && !callAccepted && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 backdrop-blur-sm">
            <div className="bg-bg-card p-8 rounded-xl border border-primary text-center">
              <h3 className="text-2xl font-bold mb-2 animate-pulse text-primary-light">Incoming Call...</h3>
              <p className="text-text-secondary mb-6">Someone is joining the consultation room</p>
              <button className="btn btn-primary btn-lg px-8 glow-green" onClick={answerCall}>
                <FaVideo /> Join Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-bg-elevated border-t border-border flex justify-center gap-6 z-10">
        <button 
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${muted ? 'bg-danger text-white' : 'bg-bg-hover text-text-primary border border-border hover:border-primary'}`}
          onClick={toggleMute}
        >
          {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button 
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${videoOff ? 'bg-danger text-white' : 'bg-bg-hover text-text-primary border border-border hover:border-primary'}`}
          onClick={toggleVideo}
        >
          {videoOff ? <FaVideoSlash /> : <FaVideo />}
        </button>
        <button 
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl bg-danger hover:bg-danger-light text-white shadow-lg transition transform hover:-translate-y-1"
          onClick={leaveCall}
        >
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );
}
