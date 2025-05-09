import './Workspace.css'
import ProfileSidebar from './ProfileSidebar/ProfileSidebar'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { service_hubs } from '../../api/api-config'

function Workspace() {
    const[callHub, setCallHub] = useState<HubConnection | null>(null)

    async function establishCallHubConnection() {
        let connection = new HubConnectionBuilder()
            .withUrl(service_hubs.Call)
            .withAutomaticReconnect()
            .build()

            try {
                await connection.start()
                setCallHub(connection)
            } catch (error) {
                console.log(error)
            }
    }

    const navigate = useNavigate()
            
    useEffect(() => {
        if (!localStorage.getItem('accessToken'))
            navigate('/auth')

        establishCallHubConnection()
    }, [])

    return(
        <div className='Workspace_outer-box'>
            <ProfileSidebar callHubConnection={callHub} />
        </div>
    )
}

export default Workspace