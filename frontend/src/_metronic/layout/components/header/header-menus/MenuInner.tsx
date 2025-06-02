import {useIntl} from 'react-intl'
import {MenuItem} from './MenuItem'
import {MenuInnerWithSub} from './MenuInnerWithSub'
import {MegaMenu} from './MegaMenu'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function MenuInner() {
  const intl = useIntl()
  const {id} = useParams()
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Lấy user_data từ localStorage thay vì dùng params
        const userDataStr = localStorage.getItem('user_data')
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          setUserData(userData)
        }
      } catch (error) {
        console.error('Error getting user data:', error)
      }
    }
    fetchUser()
  }, [])

  return (
    <>
      <h3 style={{'paddingTop':'28px'}}>{userData?.storeName || 'My Shop'}</h3>
    </>
  )
}
