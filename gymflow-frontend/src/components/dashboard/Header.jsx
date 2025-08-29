import React from 'react';

const Header = ({ title = 'Overview', searchValue = '', onSearch }) => {
  return (
    <div className="flex justify-between items-center py-4 border-b-2 border-gray-200">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            placeholder="Search members..."
            className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none border border-gray-300"
          />
          <span className="pointer-events-none absolute right-0 top-0 mt-3 mr-4">
            <svg className="text-gray-600 h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.966 56.966" width="512px" height="512px">
              <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
