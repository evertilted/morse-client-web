import './Header.css'

type HeaderProps = {
  login: string | null
}

function Header({ login }: HeaderProps) {
  return (
    <div className='Header'>
      <h1 className='Header_h1'>morse</h1>
      {
        login != null &&
        <h2 className='Header_username'>Hi {login}!</h2>
      }
      
    </div>
  );
}

export default Header;
