import { UserSearchResult } from "../UserSearchResult"
import './UserSearchItem.css'

function UserSearchItem({ id, login, displayName }: UserSearchResult) {
    return(
        <div className='UserSearchItem_box'>
            {login}#{id}
        </div>
    )
}

export default UserSearchItem