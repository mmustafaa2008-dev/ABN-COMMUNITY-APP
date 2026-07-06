enum UserRole { customer, business, admin }

class UserProfile {
  final String id;
  final String email;
  final String phone;
  final String name;
  final UserRole role;
  final String preferredLanguage;

  const UserProfile({
    required this.id,
    required this.email,
    required this.phone,
    required this.name,
    required this.role,
    required this.preferredLanguage,
  });

  UserProfile copyWith({
    String? id,
    String? email,
    String? phone,
    String? name,
    UserRole? role,
    String? preferredLanguage,
  }) {
    return UserProfile(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      name: name ?? this.name,
      role: role ?? this.role,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'phone': phone,
        'name': name,
        'role': role.name,
        'preferredLanguage': preferredLanguage,
      };

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id'] as String,
        email: json['email'] as String,
        phone: json['phone'] as String,
        name: json['name'] as String,
        role: UserRole.values.firstWhere((r) => r.name == json['role']),
        preferredLanguage: json['preferredLanguage'] as String,
      );
}

typedef LocalizedString = Map<String, String>;

enum CategoryGroup { shops, services, professionals, food }

class Category {
  final String id;
  final LocalizedString name;
  final CategoryGroup group;
  final String iconName;

  const Category({
    required this.id,
    required this.name,
    required this.group,
    required this.iconName,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'group': group.name,
        'iconName': iconName,
      };

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as String,
        name: Map<String, String>.from(json['name'] as Map),
        group: CategoryGroup.values.firstWhere((g) => g.name == json['group']),
        iconName: json['iconName'] as String,
      );
}

enum BusinessStatus { active, suspended, pending }

class Business {
  final String id;
  final String ownerId;
  final String name;
  final String logoUrl;
  final String coverUrl;
  final LocalizedString description;
  final String categoryId;
  final LocalizedString subcategory;
  final String address;
  final String city;
  final String area;
  final bool isVerified;
  final BusinessStatus status;
  final String phone;
  final String whatsapp;
  final String? website;
  final LocalizedString workingHours;
  final String membershipExpiryDate;
  final List<String> gallery;
  final double rating;
  final int reviewsCount;

  const Business({
    required this.id,
    required this.ownerId,
    required this.name,
    required this.logoUrl,
    required this.coverUrl,
    required this.description,
    required this.categoryId,
    required this.subcategory,
    required this.address,
    required this.city,
    required this.area,
    required this.isVerified,
    required this.status,
    required this.phone,
    required this.whatsapp,
    this.website,
    required this.workingHours,
    required this.membershipExpiryDate,
    required this.gallery,
    required this.rating,
    required this.reviewsCount,
  });

  Business copyWith({
    String? id,
    String? ownerId,
    String? name,
    String? logoUrl,
    String? coverUrl,
    LocalizedString? description,
    String? categoryId,
    LocalizedString? subcategory,
    String? address,
    String? city,
    String? area,
    bool? isVerified,
    BusinessStatus? status,
    String? phone,
    String? whatsapp,
    String? website,
    LocalizedString? workingHours,
    String? membershipExpiryDate,
    List<String>? gallery,
    double? rating,
    int? reviewsCount,
  }) {
    return Business(
      id: id ?? this.id,
      ownerId: ownerId ?? this.ownerId,
      name: name ?? this.name,
      logoUrl: logoUrl ?? this.logoUrl,
      coverUrl: coverUrl ?? this.coverUrl,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      subcategory: subcategory ?? this.subcategory,
      address: address ?? this.address,
      city: city ?? this.city,
      area: area ?? this.area,
      isVerified: isVerified ?? this.isVerified,
      status: status ?? this.status,
      phone: phone ?? this.phone,
      whatsapp: whatsapp ?? this.whatsapp,
      website: website ?? this.website,
      workingHours: workingHours ?? this.workingHours,
      membershipExpiryDate: membershipExpiryDate ?? this.membershipExpiryDate,
      gallery: gallery ?? this.gallery,
      rating: rating ?? this.rating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'ownerId': ownerId,
        'name': name,
        'logoUrl': logoUrl,
        'coverUrl': coverUrl,
        'description': description,
        'categoryId': categoryId,
        'subcategory': subcategory,
        'address': address,
        'city': city,
        'area': area,
        'isVerified': isVerified,
        'status': status.name,
        'phone': phone,
        'whatsapp': whatsapp,
        'website': website,
        'workingHours': workingHours,
        'membershipExpiryDate': membershipExpiryDate,
        'gallery': gallery,
        'rating': rating,
        'reviewsCount': reviewsCount,
      };

  factory Business.fromJson(Map<String, dynamic> json) => Business(
        id: json['id'] as String,
        ownerId: json['ownerId'] as String,
        name: json['name'] as String,
        logoUrl: json['logoUrl'] as String,
        coverUrl: json['coverUrl'] as String,
        description: Map<String, String>.from(json['description'] as Map),
        categoryId: json['categoryId'] as String,
        subcategory: Map<String, String>.from(json['subcategory'] as Map),
        address: json['address'] as String,
        city: json['city'] as String,
        area: json['area'] as String,
        isVerified: json['isVerified'] as bool,
        status: BusinessStatus.values.firstWhere((s) => s.name == json['status']),
        phone: json['phone'] as String,
        whatsapp: json['whatsapp'] as String,
        website: json['website'] as String?,
        workingHours: Map<String, String>.from(json['workingHours'] as Map),
        membershipExpiryDate: json['membershipExpiryDate'] as String,
        gallery: List<String>.from(json['gallery'] as List),
        rating: (json['rating'] as num).toDouble(),
        reviewsCount: json['reviewsCount'] as int,
      );
}

class Review {
  final String id;
  final String businessId;
  final String userName;
  final double rating;
  final String comment;
  final String date;

  const Review({
    required this.id,
    required this.businessId,
    required this.userName,
    required this.rating,
    required this.comment,
    required this.date,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'businessId': businessId,
        'userName': userName,
        'rating': rating,
        'comment': comment,
        'date': date,
      };

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        id: json['id'] as String,
        businessId: json['businessId'] as String,
        userName: json['userName'] as String,
        rating: (json['rating'] as num).toDouble(),
        comment: json['comment'] as String,
        date: json['date'] as String,
      );
}

enum PaymentStatus { success, failed }

class PaymentRecord {
  final String id;
  final String businessId;
  final double amount;
  final String date;
  final PaymentStatus status;
  final String refNo;

  const PaymentRecord({
    required this.id,
    required this.businessId,
    required this.amount,
    required this.date,
    required this.status,
    required this.refNo,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'businessId': businessId,
        'amount': amount,
        'date': date,
        'status': status.name,
        'refNo': refNo,
      };

  factory PaymentRecord.fromJson(Map<String, dynamic> json) => PaymentRecord(
        id: json['id'] as String,
        businessId: json['businessId'] as String,
        amount: (json['amount'] as num).toDouble(),
        date: json['date'] as String,
        status: PaymentStatus.values.firstWhere((s) => s.name == json['status']),
        refNo: json['refNo'] as String,
      );
}

class AppNotification {
  final String id;
  final String title;
  final String message;
  final String date;
  bool isRead;
  final String receiverRole; // UserRole.name or 'all'

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.date,
    required this.isRead,
    required this.receiverRole,
  });

  AppNotification copyWith({bool? isRead}) => AppNotification(
        id: id,
        title: title,
        message: message,
        date: date,
        isRead: isRead ?? this.isRead,
        receiverRole: receiverRole,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'message': message,
        'date': date,
        'isRead': isRead,
        'receiverRole': receiverRole,
      };

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as String,
        title: json['title'] as String,
        message: json['message'] as String,
        date: json['date'] as String,
        isRead: json['isRead'] as bool,
        receiverRole: json['receiverRole'] as String,
      );
}

class Product {
  final String id;
  final String businessId;
  final LocalizedString name;
  final LocalizedString description;
  final double price;
  final String imageUrl;
  final bool inStock;

  const Product({
    required this.id,
    required this.businessId,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.inStock,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'businessId': businessId,
        'name': name,
        'description': description,
        'price': price,
        'imageUrl': imageUrl,
        'inStock': inStock,
      };

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as String,
        businessId: json['businessId'] as String,
        name: Map<String, String>.from(json['name'] as Map),
        description: Map<String, String>.from(json['description'] as Map),
        price: (json['price'] as num).toDouble(),
        imageUrl: json['imageUrl'] as String,
        inStock: json['inStock'] as bool,
      );
}

class OrderItem {
  final String productId;
  final int quantity;
  final double priceAtPurchase;

  const OrderItem({
    required this.productId,
    required this.quantity,
    required this.priceAtPurchase,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'quantity': quantity,
        'priceAtPurchase': priceAtPurchase,
      };

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        productId: json['productId'] as String,
        quantity: json['quantity'] as int,
        priceAtPurchase: (json['priceAtPurchase'] as num).toDouble(),
      );
}

enum OrderStatus { pending, processing, shipped, delivered, cancelled }

class Order {
  final String id;
  final String businessId;
  final String customerName;
  final String customerPhone;
  final List<OrderItem> items;
  final double totalAmount;
  final OrderStatus status;
  final String date;

  const Order({
    required this.id,
    required this.businessId,
    required this.customerName,
    required this.customerPhone,
    required this.items,
    required this.totalAmount,
    required this.status,
    required this.date,
  });

  Order copyWith({OrderStatus? status}) => Order(
        id: id,
        businessId: businessId,
        customerName: customerName,
        customerPhone: customerPhone,
        items: items,
        totalAmount: totalAmount,
        status: status ?? this.status,
        date: date,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'businessId': businessId,
        'customerName': customerName,
        'customerPhone': customerPhone,
        'items': items.map((i) => i.toJson()).toList(),
        'totalAmount': totalAmount,
        'status': status.name,
        'date': date,
      };

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        businessId: json['businessId'] as String,
        customerName: json['customerName'] as String,
        customerPhone: json['customerPhone'] as String,
        items: (json['items'] as List).map((i) => OrderItem.fromJson(i as Map<String, dynamic>)).toList(),
        totalAmount: (json['totalAmount'] as num).toDouble(),
        status: OrderStatus.values.firstWhere((s) => s.name == json['status']),
        date: json['date'] as String,
      );
}
