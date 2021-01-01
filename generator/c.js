// Code Generator Ael -> C
//
// Invoke generate(program) with the program node to get back the C
// translation as a string.

export default function generate(program) {
  const output = []

  // Variable names in C will be suffixed with _1, _2, _3, etc. This is
  // because "while", for example, is a legal variable name in Ael, but
  // not in C. So we want to generate something like "while_1". We handle
  // this by mapping each variable declaration to its suffix.
  const targetName = (mapping => {
    return declaration => {
      if (!mapping.has(declaration)) {
        mapping.set(declaration, mapping.size + 1)
      }
      return `${declaration.name}_${mapping.get(declaration)}`
    }
  })(new Map())

  const gen = node => generators[node.constructor.name](node)

  const generators = {
    Program(p) {
      output.push("#include <stdio.h>")
      output.push("#include <math.h>")
      output.push("int main() {")
      p.statements.forEach(gen)
      output.push("return 0;")
      output.push("}")
    },
    Declaration(d) {
      output.push(`double ${targetName(d)} = ${gen(d.initializer)};`)
    },
    Assignment(s) {
      const source = gen(s.source)
      const target = gen(s.target)
      output.push(`${target} = ${source};`)
    },
    PrintStatement(s) {
      output.push(`printf("%g\\n", ${gen(s.expression)});`)
    },
    BinaryExpression(e) {
      return `(${gen(e.left)} ${e.op} ${gen(e.right)})`
    },
    UnaryExpression(e) {
      const op = { abs: "fabs" }[e.op] ?? e.op
      return `${op}(${gen(e.operand)})`
    },
    IdentifierExpression(e) {
      return targetName(e.ref)
    },
    LiteralExpression(e) {
      return e.value
    },
  }

  gen(program)
  return output.join("\n")
}
