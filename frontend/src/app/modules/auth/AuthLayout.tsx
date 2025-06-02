import {useEffect} from 'react'
import {Outlet} from 'react-router-dom'

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <div className='auth-page'>
      {/* begin::Content */}
      <div className='d-flex flex-center flex-column h-100'>
        {/* begin::Wrapper */}
        <div className='w-100' style={{maxWidth: '500px'}}>
          <Outlet />
        </div>
        {/* end::Wrapper */}
      </div>
      {/* end::Content */}

      <style>
        {`
          .auth-page {
            min-height: 100vh;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: #f0f8ff;
            background-image: linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%);
            overflow-y: auto;
            padding: 2rem;
          }

          .auth-page > div {
            flex: 1;
          }

          @media (max-height: 600px) {
            .auth-page {
              height: auto;
              min-height: 100vh;
            }
          }

          .auth-page a {
            color: #0095e8;
            transition: all 0.3s ease;
          }

          .auth-page a:hover {
            color: #0077ba;
            text-decoration: none;
          }
        `}
      </style>
    </div>
  )
}

export {AuthLayout}
