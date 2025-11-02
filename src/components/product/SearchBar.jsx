import React from 'react'

const SearchBar = ({setSearchItem}) => {
  return (
    <div className='search-bar'>
      <input
       type="text" placeholder="Search..." 
       onChange={(e) => setSearchItem(e.target.value)} />
    </div>
  )
}

export default SearchBar
