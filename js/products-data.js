// Dữ liệu sản phẩm
const PRODUCTS = [
    {
        id: 'p001',
        slug: 'aurelius-chronomaster-black',
        name: 'Aurelius Chronomaster Đen',
        brand: 'Aurelius',
        price: 79990000,
        compareAt: 91990000,
        inventory: 12,
        sku: 'AUR-CHR-BK-42',
        images: [
            '../project/img/imgproducts/chronomaster-black.jpg',
            '../project/img/imgproducts/chronomaster-black3.jpg',
            '../project/img/imgproducts/chronomaster-black2.jpg'
    
        ],
        categories: ['Nam', 'Cơ tự động'],
        attributes: {
            movement: 'Cơ tự động',
            caseSize: '42mm',
            waterResistance: '100m',
            strap: 'Da',
            caseMaterial: 'Thép không gỉ',
            crystal: 'Sapphire'
        },
        rating: 4.7,
        reviews: [
            {
                userId: 'u002',
                userName: 'Nguyễn Văn A',
                stars: 5,
                text: 'Hoàn thiện tuyệt đẹp và nghề thủ công đáng kinh ngạc. Bộ máy tự động giữ thời gian hoàn hảo.',
                date: '2025-01-01',
                verified: true
            },
            {
                userId: 'u003',
                userName: 'Trần Thị B',
                stars: 4,
                text: 'Đồng hồ đẹp, mặc dù dây da có thể mềm hơn.',
                date: '2024-12-28',
                verified: true
            }
        ],
        description: '<p>Aurelius Chronomaster Đen đại diện cho đỉnh cao của nghề chế tác đồng hồ Thụy Sĩ. Với bộ máy tự động chính xác, kính sapphire và dây da cao cấp, chiếc đồng hồ này kết hợp nghề thủ công truyền thống với sự tinh tế hiện đại.</p><p>Mỗi chiếc đồng hồ được lắp ráp tỉ mỉ bằng tay và trải qua kiểm tra chất lượng nghiêm ngặt để đảm bảo hiệu suất đáng tin cậy trong nhiều thập kỷ.</p>',
        featured: true,
        new: false,
        bestseller: true
    },
    {
        id: 'p002',
        slug: 'tempus-elegance-rose-gold',
        name: 'Tempus Elegance Vàng Hồng',
        brand: 'Tempus',
        price: 60490000,
        compareAt: null,
        inventory: 8,
        sku: 'TMP-ELG-RG-38',
        images: [
            '../project/img/imgproducts/Rose-gold.jpg',
            '../project/img/imgproducts/Rose-gold2.jpg'
        ],
        categories: ['Nữ', 'Cơ tự động'],
        attributes: {
            movement: 'Cơ tự động',
            caseSize: '38mm',
            waterResistance: '50m',
            strap: 'Dây thép',
            caseMaterial: 'Vàng hồng',
            crystal: 'Sapphire'
        },
        rating: 4.9,
        reviews: [
            {
                userId: 'u004',
                userName: 'Lê Thị C',
                stars: 5,
                text: 'Tuyệt đối tuyệt đẹp! Hoàn thiện vàng hồng hoàn hảo và vừa vặn tuyệt đẹp.',
                date: '2025-01-02',
                verified: true
            }
        ],
        description: '<p>Hoàn thiện vàng hồng thanh lịch với bộ máy tự động, hoàn hảo cho mọi dịp. Bộ sưu tập Tempus Elegance thể hiện nữ tính tinh tế với kỹ thuật chính xác Thụy Sĩ.</p><p>Được chế tác từ vật liệu cao cấp với sự chú ý đến từng chi tiết, chiếc đồng hồ này được thiết kế vừa là đồng hồ chức năng vừa là tuyên bố phong cách.</p>',
        featured: true,
        new: true,
        bestseller: false
    },
    {
        id: 'p003',
        slug: 'chronos-sport-titanium',
        name: 'Chronos Sport Titanium',
        brand: 'Chronos',
        price: 104090000,
        compareAt: null,
        inventory: 5,
        sku: 'CHR-SPT-TI-44',
        images: [
            '../project/img/imgproducts/sport-titanium.jpg',
            '../project/img/imgproducts/sport-titanium2.jpg'
        ],
        categories: ['Nam', 'Chronograph'],
        attributes: {
            movement: 'Chronograph',
            caseSize: '44mm',
            waterResistance: '200m',
            strap: 'Dây Titanium',
            caseMaterial: 'Titanium',
            crystal: 'Sapphire'
        },
        rating: 4.8,
        reviews: [],
        description: '<p>Chronograph thể thao chuyên nghiệp với cấu trúc titanium cho độ bền tối ưu. Được chế tạo cho lối sống năng động trong khi vẫn duy trì độ chính xác và sự thanh lịch Thụy Sĩ.</p><p>Các tính năng bao gồm vành bezel tachymeter, kim và vạch số phát sáng, và khả năng chống nước cấp chuyên nghiệp phù hợp cho các môn thể thao dưới nước nghiêm túc.</p>',
        featured: false,
        new: true,
        bestseller: false
    },
    {
        id: 'p004',
        slug: 'aurelius-heritage-silver',
        name: 'Aurelius Heritage Bạc',
        brand: 'Aurelius',
        price: 70190000,
        compareAt: 79990000,
        inventory: 15,
        sku: 'AUR-HER-SV-40',
        images: [
            '../project/img/imgproducts/heritage-silver.jpg'
        ],
        categories: ['Nam', 'Cơ tự động'],
        attributes: {
            movement: 'Cơ tự động',
            caseSize: '40mm',
            waterResistance: '100m',
            strap: 'Thép không gỉ',
            caseMaterial: 'Thép không gỉ',
            crystal: 'Sapphire'
        },
        rating: 4.6,
        reviews: [
            {
                userId: 'u005',
                userName: 'Phạm Văn D',
                stars: 5,
                text: 'Thiết kế cổ điển không bao giờ lỗi thời. Chất lượng xây dựng tuyệt vời.',
                date: '2024-12-30',
                verified: true
            }
        ],
        description: '<p>Một thiết kế vượt thời gian tôn vinh di sản của chúng tôi trong khi kết hợp công nghệ bộ máy Thụy Sĩ hiện đại. Bộ sưu tập Heritage thể hiện cam kết của chúng tôi với các giá trị chế tác đồng hồ truyền thống.</p>',
        featured: false,
        new: false,
        bestseller: true
    },
    {
        id: 'p005',
        slug: 'tempus-minimalist-white',
        name: 'Tempus Minimalist Trắng',
        brand: 'Tempus',
        price: 45990000,
        compareAt: null,
        inventory: 20,
        sku: 'TMP-MIN-WH-36',
        images: [
            '../project/img/imgproducts/Minimalist-white.jpg',
            '../project/img/imgproducts/Minimalist-white2.jpg'
        ],
        categories: ['Nữ', 'Quartz'],
        attributes: {
            movement: 'Quartz',
            caseSize: '36mm',
            waterResistance: '30m',
            strap: 'Da',
            caseMaterial: 'Thép không gỉ',
            crystal: 'Khoáng chất'
        },
        rating: 4.4,
        reviews: [],
        description: '<p>Thiết kế tối giản, sạch sẽ hoàn hảo cho việc đeo hàng ngày. Bộ sưu tập Minimalist tập trung vào các yếu tố thiết yếu và sức hấp dẫn thẩm mỹ thuần túy.</p>',
        featured: false,
        new: true,
        bestseller: false
    },
    {
        id: 'p006',
        slug: 'chronos-diver-blue',
        name: 'Chronos Diver Xanh',
        brand: 'Chronos',
        price: 91990000,
        compareAt: null,
        inventory: 7,
        sku: 'CHR-DIV-BL-42',
        images: [
            '../project/img/imgproducts/chronos-diver-blue.jpg'
        ],
        categories: ['Nam', 'Cơ tự động'],
        attributes: {
            movement: 'Cơ tự động',
            caseSize: '42mm',
            waterResistance: '300m',
            strap: 'Cao su',
            caseMaterial: 'Thép không gỉ',
            crystal: 'Sapphire'
        },
        rating: 4.9,
        reviews: [],
        description: '<p>Đồng hồ lặn chuyên nghiệp với vành bezel quay một chiều và khả năng chống nước đặc biệt. Được chế tạo theo tiêu chuẩn lặn ISO 6425.</p>',
        featured: true,
        new: false,
        bestseller: false
    }
];

// Cài đặt mặc định
const SETTINGS = {
    storeName: 'Aurelius Time',
    storeDescription: 'Đồng hồ Thụy Sĩ cao cấp được chế tác với độ chính xác và sự thanh lịch',
    currency: 'VND',
    currencySymbol: '₫',
    shipping: {
        freeShippingThreshold: 20000000,
        standardRate: 500000,
        expressRate: 1000000,
        internationalRate: 1500000,
        processingDays: 2
    },
    tax: {
        enabled: true,
        rate: 0.08,
        includedInPrice: false
    }
};
