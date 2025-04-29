import React, { useContext } from 'react'
import { MapContext } from '../context/MapContext';

 const MapComponentOwner = ({spots}) => {

    const {isLoaded,loadError}=useContext(MapContext);
  return (
    <Box>

    </Box>
  )
}

export default MapComponentOwner;
