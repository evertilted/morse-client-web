import { useEffect } from 'react'
import './Workspace.css'
import { API_Service_User } from '../../api/endpoint_implementations/API_Service_User'
import { Axios, AxiosError, isAxiosError } from 'axios'
import ProfileSidebar from './ProfileSidebar/ProfileSidebar'

function Workspace() {
    return(
        <div className='Workspace_outer-box'>
            <ProfileSidebar />
        </div>
    )
}

export default Workspace