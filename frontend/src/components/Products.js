import React from 'react'
import axios from 'axios';
import Productcard from './Productcard'

const Products = () => {
  return (
    <div className='products-con'>
      <h2 class="fw-bold">HAIRCARE BEAUTY OFFERS</h2>
        <div className='products'>
          <Productcard />
        </div>
    </div>

  )
}

export default Products