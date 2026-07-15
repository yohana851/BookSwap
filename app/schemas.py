from marshmallow import Schema, ValidationError, fields, validate


class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True, validate=validate.Length(max=100))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    role = fields.Str(
        required=False,
        load_default="buyer",
        validate=validate.OneOf(["buyer", "seller"]),
    )


class UpdateUserSchema(Schema):
    username = fields.Str(required=False, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=False, validate=validate.Length(max=100))
    password = fields.Str(required=False, validate=validate.Length(min=6))
    role = fields.Str(required=False, validate=validate.OneOf(["buyer", "seller", "admin"]))
    is_active = fields.Bool(required=False)


class LoginSchema(Schema):
    identifier = fields.Str(required=True, validate=validate.Length(min=1))
    password = fields.Str(required=True)


class CategorySchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=50))


class BookSchema(Schema):
    seller_id = fields.Int(required=True)
    category_id = fields.Int(required=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    author = fields.Str(required=False, allow_none=True, validate=validate.Length(max=255))
    isbn = fields.Str(required=False, allow_none=True, validate=validate.Length(equal=16))
    price = fields.Decimal(required=True, as_string=False)
    condition = fields.Str(
        required=False,
        allow_none=True,
        validate=validate.OneOf(["New", "Like New", "Good", "Fair", "Poor"]),
    )
    image_url = fields.Str(required=False, allow_none=True)
    description = fields.Str(required=False, allow_none=True)
    status = fields.Str(
        required=False,
        load_default="Available",
        validate=validate.OneOf(["Available", "Sold", "Pending"]),
    )


class ReviewSchema(Schema):
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(required=False, allow_none=True, validate=validate.Length(max=1000))


class CartItemSchema(Schema):
    book_id = fields.Int(required=True)


class WishlistItemSchema(Schema):
    book_id = fields.Int(required=True)


class OrderSchema(Schema):
    book_id = fields.Int(required=True)
    buyer_id = fields.Int(required=True)
    total_amount = fields.Decimal(required=True, as_string=False)
    delivery_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    delivery_phone = fields.Str(
        required=True,
        validate=validate.Regexp(r"^\d{10}$", error="Phone number must be exactly 10 digits"),
    )
    delivery_address = fields.Str(required=True, validate=validate.Length(min=5, max=255))
    delivery_location = fields.Str(
        required=True, validate=validate.OneOf(["Inside Valley", "Outside Valley"])
    )
    payment_method = fields.Str(
        required=False, load_default="COD", validate=validate.OneOf(["COD"])
    )


class CheckoutSchema(Schema):
    delivery_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    delivery_phone = fields.Str(
        required=True,
        validate=validate.Regexp(r"^\d{10}$", error="Phone number must be exactly 10 digits"),
    )
    delivery_address = fields.Str(required=True, validate=validate.Length(min=5, max=255))
    delivery_location = fields.Str(
        required=True, validate=validate.OneOf(["Inside Valley", "Outside Valley"])
    )
    payment_method = fields.Str(
        required=False, load_default="COD", validate=validate.OneOf(["COD"])
    )


def validate_payload(schema, payload):
    try:
        return schema.load(payload or {}), None
    except ValidationError as err:
        return None, err.messages
