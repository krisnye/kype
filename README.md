# kype
Type Inference Library

## TODO
[x] Infer type of an expression based upon other assertions
[x] Figure out how to type multiplied values (@ >= 5) * (@ >= 10)
Infer Type for Member Expression


## Types of Runtime Errors

- divide by zero
- modulo by zero
- integer overflow
- integer underflow
- infinite loop
- infinite recursion
- out of memory
- null pointer

##  Indented Syntax

var x = 12
type Foo = 10 .. 20

//  only meta class for now.
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

//  struct or some shiz?
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

##  Compiler

Folders are always lower case
Files are always upper case

    namespace/
        Foo.ion
            # var foo       namespace:Foo.foo
            # class Foo     namespace:Foo
            # type Bar      namespace:Foo.Bar

##  Phases

- Parse
- Separate each declaration
- Resolve Externals
- Compile Dependencies
- Compile Self
- Store Compiled External Details

##  Recompile

- Reparse changed file
- Separate each declaration
- Compare to previously cached values and skip unchanged
- Resolve externals
- Compile Dependencies
- Compile Self
- Compile Dependents
- Update Compiled External Details
