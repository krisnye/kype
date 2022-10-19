# kype
Type Inference Library

## TODO
Infer type of an expression based upon other assertions
Figure out how to type multiplied values
    (this >= 5) * (this >= 10)

## Types of Runtime Errors

- divide by zero
- modulo by zero
- integer overflow
- integer underflow
- infinite loop
- infinite recursion
- out of memory
- null pointer

## Adding Types

    this > 5 && this < 10
    +
    this > 20 && this < 30
    -------------------------
    this > 5 + this > 20    =>  this > 25
    this > 5 + this < 30    =>  null
    this < 10 + this > 20   =>  null
    this < 10 + this < 30   => this < 40
    =>
    this > 25 && this < 40

##  Indented Syntax

var x = 12
type Foo = 10 .. 20

@Meta()
class Vector
    x: Number
    y: Number
    translate(x: Number, y: Number) => Vector(this.x + x, this.y + y)

function foo(a: Type, b: Type) =>
    if a is Bar
        return 12
    else
        for i in 0 .. 20
            return 20

@Meta()
@Bar()
function fooWithMeta(
    @Meta(12)
    a: Type
    @Meta()
    b: Type
) =>
    callOutline()
        12
        20
        30
