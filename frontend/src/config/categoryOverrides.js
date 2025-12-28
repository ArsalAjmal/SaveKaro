

export const categoryOverrides = {
  men: {
    // Example:
    // custom: ['Shirts', 'T-Shirts', 'Jeans', 'Kurta', 'Shoes'],
    order: ['Eastern'],
    exclude: [],
    rename: {
      'hoodie': 'Hoodies',
      'hoodies': 'Hoodies',
      'sweater': 'Sweaters',
      'sweaters': 'Sweaters',
      'jacket': 'Jackets',
      'jackets': 'Jackets',
      'jeans': 'Jeans',
      't-shirts': 'Shirts',
      'tshirt': 'Shirts',
      'tshirts': 'Shirts',
      't shirt': 'Shirts',
      't-shirts ': 'Shirts',
      'other': 'Others',
      'others': 'Others',
    },
    last: ['Others'],
    groups: [
      {
        label: 'Eastern',
        includes: [
          'shalwar',
          'shalwar kameez',
          'shalwar qameez',
          'kurta',
          'kameez',
          'suit',
          'suits',
        ],
      },
      {
        label: 'Shirts',
        includes: [
          'shirt',
          'shirts',
          'tshirt',
          't-shirts',
          't shirt',
          'tee',
          'tees',
        ],
      },
    ],
  },
  women: {
    // Example:
    // order: ['Pret', 'Unstitched', 'Kurtis', 'Jeans', 'Shoes'],
    order: ['Eastern'],
    exclude: [],
    rename: {
      'hoodie': 'Hoodies',
      'hoodies': 'Hoodies',
      'sweater': 'Sweaters',
      'sweaters': 'Sweaters',
      'jacket': 'Jackets',
      'jackets': 'Jackets',
      'jeans': 'Jeans',
      't-shirts': 'Shirts',
      'tshirt': 'Shirts',
      'tshirts': 'Shirts',
      't shirt': 'Shirts',
      'other': 'Others',
      'others': 'Others',
    },
    last: ['Others'],
    groups: [
      {
        label: 'Eastern',
        includes: [
          'dress',
          'dresses',
          'shalwar',
          'shalwar kameez',
          'shalwar qameez',
          'kurta',
          'kameez',
          'suit',
          'suits',
        ],
      },
      {
        label: 'Shirts',
        includes: [
          'shirt',
          'shirts',
          'tshirt',
          't-shirts',
          't shirt',
          'tee',
          'tees',
        ],
      },
    ],
  },
};
