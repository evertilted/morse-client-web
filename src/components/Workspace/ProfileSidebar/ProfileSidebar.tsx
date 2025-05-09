import { useEffect } from 'react'
import { signalRService, FriendRequest } from '../../../api/SignalRService';
import './ProfileSidebar.css'

function ProfileSidebar() {

    const FriendComponent: React.FC = () => {
        useEffect(() => {
          const handleFriendRequest = (user: FriendRequest, message: string) => {
            console.log("New friend request from:", user);
            alert(`${user.username} sent you a friend request!`);
          };
      
          signalRService.startConnection();
          signalRService.setupFriendRequestListener(handleFriendRequest);
      
          return () => {
            signalRService.connection.off("ReceiveFriendRequest");
            signalRService.stopConnection();
          };
        }, []);
      
        const handleSendRequest = () => {
          signalRService.sendFriendRequest("123"); // ID получателя
        };

    return (
        <div className="ProfileSidebar_outer-box">
            <h1 className='ProfileSidebar_username'>{localStorage.getItem('login')}</h1>
        </div>
    )
}

export default ProfileSidebar