from marshmallow import Schema, ValidationError, fields, validate


class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True, validate=validate.Length(max=100))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    role = fields.Str(
        required=False,
        load_default="buyer",
        validate=validate.OneOf(["buyer", "seller", "admin"]),
    )


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class CategorySchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=50))


class BookSchema(Schema):
    seller_id = fields.Int(required=True)
    category_id = fields.Int(required=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    author = fields.Str(required=False, allow_none=True, validate=validate.Length(max=255))
    isbn = fields.Str(required=False, allow_none=True, validate=validate.Length(equal=13))
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


class OrderSchema(Schema):
    book_id = fields.Int(required=True)
    buyer_id = fields.Int(required=True)
    total_amount = fields.Decimal(required=True, as_string=False)
    payment_status = fields.Str(
        required=False,
        load_default="Paid",
        validate=validate.OneOf(["Paid", "Refunded", "Pending"]),
    )


def validate_payload(schema, payload):
    try:
        return schema.load(payload or {}), None
    except ValidationError as err:
        return None, err.messages
