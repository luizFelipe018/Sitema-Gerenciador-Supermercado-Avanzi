const productRepository = require('../repositories/productRepository')

exports.findAll = async () => {
    return productRepository.findAll()
}

exports.findByCodigo = async (codigo) => {
    const product = await productRepository.findByCodigo(codigo)
    if (!product) throw new Error('Produto não encontrado')
    return product
}

exports.create = async (data) => {
    if (!data.codigo) throw new Error('Código obrigatório')
    if (!data.descricao) throw new Error('Descrição obrigatória')

    const existente = await productRepository.findByCodigo(data.codigo)
    if (existente) throw new Error('Já existe um produto com esse código')

    return productRepository.save(data)
}

exports.update = async (codigo, data) => {
    if (!data.descricao) throw new Error('Descrição obrigatória')
    await exports.findByCodigo(codigo)
    return productRepository.update(codigo, data)
}

exports.remove = async (codigo) => {
    await exports.findByCodigo(codigo)
    return productRepository.remove(codigo)
}