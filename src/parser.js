// Parser
//
// Exports a single function called parse which accepts the source code
// as a string and returns the AST.

import ohm from "ohm-js"
import * as ast from "./ast.js"

const aelGrammar = ohm.grammar(String.raw`Ael {
  Program   = Statement+
  Statement = let id "=" Equ                  --vardec
            | Var "=" Equ                     --assign
            | print Equ                       --print
  Equ       = Equ "==" Exp                  --binary
            | Exp
  Exp       = Exp ("+" | "-") Term            --binary
            | Term
  Term      = Term ("*"| "/"| "%") Unary          --binary
            | Unary
  Unary    = "(" Equ ")"                     --parens
            | ("-" | abs | sqrt) Unary       --unary
            | Exponent
  Exponent  = Factor "**" Exponent           --binary
            | Factor
  Factor    = Var
            | num

  Var       = id
  num       = digit+ ("." digit+)?
  let       = "let" ~alnum
  print     = "print" ~alnum
  abs       = "abs" ~alnum
  sqrt      = "sqrt" ~alnum
  keyword   = let | print | abs | sqrt
  id        = ~keyword letter alnum*
  space    += "//" (~"\n" any)* ("\n" | end)  --comment
}`)

const astBuilder = aelGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast())
  },
  Statement_vardec(_let, id, _eq, expression) {
    return new ast.Variable(id.sourceString, expression.ast())
  },
  Statement_assign(variable, _eq, expression) {
    return new ast.Assignment(variable.ast(), expression.ast())
  },
  Statement_print(_print, expression) {
    return new ast.PrintStatement(expression.ast())
  },
  Equ_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Term_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Unary_unary(op, operand) {
    return new ast.UnaryExpression(op.sourceString, operand.ast())
  },
  Unary_parens(_open, expression, _close) {
    return expression.ast()
  },
  Exponent_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Var(id) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  num(_whole, _point, _fraction) {
    return Number(this.sourceString)
  },
})

export default function parse(sourceCode) {
  const match = aelGrammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).ast()
}
