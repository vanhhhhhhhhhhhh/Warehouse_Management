import {Route, Routes, Navigate} from 'react-router-dom'
import {Error500} from './components/Error500'
import {Error404} from './components/Error404'
import Error401 from './components/Error401'

const ErrorsPage = () => (
  <Routes>
    <Route>
      <Route path='404' element={<Error404 />} />
      <Route path='500' element={<Error500 />} />
      <Route path='401' element={<Error401 />} />
      <Route index element={<Navigate to='404' />} />
    </Route>
  </Routes>
)

export {ErrorsPage}
