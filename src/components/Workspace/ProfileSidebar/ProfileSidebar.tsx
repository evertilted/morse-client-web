import { useEffect, useState } from 'react'
import './ProfileSidebar.css'
import { HubConnection } from '@microsoft/signalr'
import { UserSearchResult } from './UserSearchResult'
import UserSearchItem from './UserSearchItem/UserSearchItem'

type ProfileSidebarProps = {
    callHubConnection: HubConnection | null
}

function ProfileSidebar({ callHubConnection }: ProfileSidebarProps) {
    const [foundUsers, setFoundUsers] = useState<UserSearchResult[]>([])

    useEffect(() => {
        callHubConnection?.on('ReceiveUserSearchResult', function(users: UserSearchResult[]) {
            setFoundUsers(users)
        })
    }, [callHubConnection])

    const handleUserSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let searchBy = event.target.value

        if (searchBy && callHubConnection != null) {
            try {
                let uidString = localStorage.getItem('userId')
                
                if (uidString) {
                    let uid = parseInt(uidString)
                    await callHubConnection.invoke('FindUserByLogin', uid, searchBy)
                }
            }
            catch {
                setFoundUsers([])
            }
        }
        else {
            setFoundUsers([])
        }
    }

    return (
        <div className="ProfileSidebar_outer-box">
            <h1 className='ProfileSidebar_username'>{localStorage.getItem('login')}</h1>
            <hr />

            <div className='ProfileSidebar_UserSearchBox'>
                <input 
                    type='Text' 
                    className='ProfileSidebar_UserSearchBox_Input' 
                    placeholder='Search users'
                    onChange={(e) => handleUserSearch(e)} />

                <div className='ProfileSidebar_UserSearchBox_ResultBox'>
                    { foundUsers.length == 0 
                    ? <h2> No users found </h2> 
                    : foundUsers.map(user => <UserSearchItem id={user.id} login={user.login} displayName={user.displayName} key={user.id} />)}
                </div>
            </div>
        </div>
    )
}

export default ProfileSidebar