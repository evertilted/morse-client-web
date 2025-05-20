import { useEffect, useState, useRef } from "react";
import './CallRoom.css';
import { HubConnection } from "@microsoft/signalr";

type Participant = {
    login: string;
    id: number;
    connectionId: string;
    audioElement?: HTMLAudioElement;
    peerConnection?: RTCPeerConnection;
};

type CallRoomProps = {
    CallHub: HubConnection;
};

function CallRoom({ CallHub }: CallRoomProps) {
    const [roomCode, setRoomCode] = useState('');
    const [inputRoomCode, setInputRoomCode] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const localConnectionIdRef = useRef<string>('');

    const initializeWebRTC = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Obtained local stream with audio tracks:", stream.getAudioTracks());
        localStreamRef.current = stream;
        setIsCallActive(true);
        
        // Для каждого существующего участника создаем peer connection
        participants.forEach(p => {
            if (p.connectionId && p.connectionId !== CallHub.connectionId) {
                createPeerConnection(p.connectionId);
            }
        });
        
            await CallHub.invoke('GetParticipantsForWebRTC', roomCode, CallHub.connectionId);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const createPeerConnection = (targetConnectionId: string) => {
        if (peerConnectionsRef.current[targetConnectionId]) {
            return peerConnectionsRef.current[targetConnectionId];
        }

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                // Добавьте TURN серверы при необходимости
            ]
        });

        // Добавляем локальные треки
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
                console.log(`Added ${track.kind} track to peer connection for ${targetConnectionId}`);
            });
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`Sending ICE candidate to ${targetConnectionId}:`, event.candidate);
                CallHub.invoke('SendIceCandidate', roomCode, targetConnectionId, JSON.stringify(event.candidate));
            }
        };

        peerConnection.ontrack = (event) => {
            console.log(`Received track from ${targetConnectionId}:`, event.track.kind);
            
            if (event.track.kind === 'audio') {
                const audioElement = document.createElement('audio');
                audioElement.id = `audio-${targetConnectionId}`;
                audioElement.autoplay = true;
                audioElement.controls = false;
                document.body.appendChild(audioElement);
                
                const stream = new MediaStream([event.track]);
                audioElement.srcObject = stream;
                
                setParticipants(prev => prev.map(p => {
                    if (p.connectionId === targetConnectionId) {
                        return { ...p, audioElement };
                    }
                    return p;
                }));
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${targetConnectionId}:`, peerConnection.connectionState);
        };

        peerConnectionsRef.current[targetConnectionId] = peerConnection;
        return peerConnection;
    };

    // Обработка сигналов WebRTC
    const handleWebRTCSignal = async (senderConnectionId: string, signal: string) => {
        const signalData = JSON.parse(signal);
        
        if (!peerConnectionsRef.current[senderConnectionId]) {
            createPeerConnection(senderConnectionId);
        }

        const peerConnection = peerConnectionsRef.current[senderConnectionId];
        
        if (signalData.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            CallHub.invoke('SendWebRTCSignal', roomCode, senderConnectionId, JSON.stringify(answer));
        } else if (signalData.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));
        }
    };

    // Обработка ICE кандидатов
    const handleIceCandidate = async (senderConnectionId: string, candidate: string) => {
        try {
            const iceCandidate = JSON.parse(candidate);
            
            if (peerConnectionsRef.current[senderConnectionId]) {
                await peerConnectionsRef.current[senderConnectionId].addIceCandidate(
                    new RTCIceCandidate(iceCandidate)
                ).catch(e => console.error('Error adding ICE candidate:', e));
            }
        } catch (e) {
            console.error('Error parsing ICE candidate:', e);
        }
    };

    // Обработка списка участников для WebRTC
    const handleParticipantsForWebRTC = async (connectionIds: string[]) => {
        for (const connectionId of connectionIds) {
            if (connectionId !== localConnectionIdRef.current && !peerConnectionsRef.current[connectionId]) {
                const peerConnection = createPeerConnection(connectionId);
                
                // Создаем offer
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                
                CallHub.invoke('SendWebRTCSignal', roomCode, connectionId, JSON.stringify(offer));
            }
        }
    };

    // Остановка всех соединений
    const stopAllConnections = () => {
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        peerConnectionsRef.current = {};
        
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        
        setIsCallActive(false);
    };

    // Эффекты для обработки событий SignalR
    useEffect(() => {
        if (!CallHub) return;

        const handleNewParticipant = (userData: string) => {
            const [login, id] = userData.split('#');
            const participantId = parseInt(id);
            
            setParticipants(prev => {
                if (prev.some(p => p.id === participantId)) {
                    return prev;
                }
                return [...prev, { login, id: participantId, connectionId: '' }];
            });
        };

        const handleParticipantLeft = (userData: string) => {
            const [login, id] = userData.split('#');
            const participantId = parseInt(id);
            
            setParticipants(prev => {
                const leavingParticipant = prev.find(p => p.id === participantId);
                if (leavingParticipant?.connectionId && peerConnectionsRef.current[leavingParticipant.connectionId]) {
                    peerConnectionsRef.current[leavingParticipant.connectionId].close();
                    delete peerConnectionsRef.current[leavingParticipant.connectionId];
                }
                
                return prev.filter(p => p.id !== participantId);
            });
        };

        const handleConnectionId = (connectionId: string) => {
            setParticipants(prev => 
                prev.map(p => 
                    p.id === parseInt(connectionId.split('-')[0]) 
                        ? { ...p, connectionId } 
                        : p
                )
            );
        };

        CallHub.on('ReceiveNewParticipant', handleNewParticipant);
        CallHub.on('ReceiveParticipantLeft', handleParticipantLeft);
        CallHub.on('ReceiveWebRTCSignal', handleWebRTCSignal);
        CallHub.on('ReceiveIceCandidate', handleIceCandidate);
        CallHub.on('ReceiveParticipantsForWebRTC', handleParticipantsForWebRTC);

        return () => {
            CallHub.off('ReceiveNewParticipant', handleNewParticipant);
            CallHub.off('ReceiveParticipantLeft', handleParticipantLeft);
            CallHub.off('ReceiveWebRTCSignal', handleWebRTCSignal);
            CallHub.off('ReceiveIceCandidate', handleIceCandidate);
            CallHub.off('ReceiveParticipantsForWebRTC', handleParticipantsForWebRTC);
        };
    }, [CallHub]);

    useEffect(() => {
        if (CallHub?.connectionId) {
            localConnectionIdRef.current = CallHub.connectionId;
        }
    }, [CallHub?.connectionId]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const handleCreateRoom = async () => {
        try {
            if (!CallHub || CallHub.state !== "Connected") {
                alert("SignalR connection is not established");
                return;
            }
            
            const login = localStorage.getItem('login');
            if (!login) {
                alert('Необходимо авторизоваться');
                return;
            }
            
            console.log("Creating room...");
            const roomCode = await CallHub.invoke('CreateRoom', login);
            setRoomCode(roomCode);
        } catch (error) {
            console.error('Ошибка при создании комнаты:', error);
            alert(`Не удалось создать комнату: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleJoinRoom = async () => {
        try {
            if (!CallHub || CallHub.state !== "Connected") {
                alert("SignalR connection is not established");
                return;
            }

            if (!inputRoomCode.trim()) {
                alert('Please enter room code');
                return;
            }

            const login = localStorage.getItem('login');
            if (!login) {
                alert('You need to login first');
                return;
            }

            console.log("Attempting to join room with code:", inputRoomCode);
            const success = await CallHub.invoke('JoinRoom', inputRoomCode, login);
            console.log("JoinRoom result:", success);
            
            if (success) {
                setRoomCode(inputRoomCode);
            } else {
                alert("Failed to join room (server returned false)");
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert(`Failed to join room: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleLeaveRoom = async () => {
        if (isLeaving) return;
        
        setIsLeaving(true);
        try {
            stopAllConnections();
            
            setParticipants(prev => {
                prev.forEach(p => {
                    if (p.audioElement) {
                        p.audioElement.pause();
                        p.audioElement.srcObject = null;
                    }
                });
                return [];
            });
            
            await CallHub.invoke('LeaveRoom', roomCode);
            setRoomCode('');
        } catch (error) {
            console.error('Error leaving room:', error);
        } finally {
            setIsLeaving(false);
        }
    };

    return (
        <div className="Callroom_outbox">
            {!roomCode ? (
                <div className='Callroom_join_form'>
                    <button 
                        className='Callroom_create_button' 
                        onClick={handleCreateRoom}
                    >
                        Create a room
                    </button>
                    <h2>or join call with code</h2>
                    <div className='Callroom_join_code_form'>
                        <input 
                            type='text' 
                            placeholder='Room code' 
                            className='Callroom_join_code_Input'
                            value={inputRoomCode}
                            onChange={(e) => setInputRoomCode(e.target.value)}
                        />
                        <button onClick={handleJoinRoom}>Join</button>
                    </div>
                </div>
            ) : (
                <div className="Callroom_active">
                    <h1>Room Code: {roomCode}</h1>
                    <div className="Callroom_participants">
                        <h3>Participants:</h3>
                        <ul>
                            {participants.map((p, index) => (
                                <li key={index}>
                                    {p.login} 
                                    {p.connectionId === localConnectionIdRef.current && " (You)"}
                                    {p.audioElement && " 🎤"}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="Callroom_controls">
                        {!isCallActive ? (
                            <button onClick={initializeWebRTC} disabled={isLeaving}>
                                Start Call
                            </button>
                        ) : (
                            <>
                                <button onClick={stopAllConnections} disabled={isLeaving}>
                                    Stop Call
                                </button>
                                <button onClick={toggleMute}>
                                    {isMuted ? 'Unmute' : 'Mute'}
                                </button>
                            </>
                        )}
                        <button onClick={handleLeaveRoom} disabled={isLeaving}>
                            {isLeaving ? 'Leaving...' : 'Leave Room'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CallRoom;