const productService = require('../services/productService')

exports.findAll = async (req, res) => {
    try {
        const products = await productService.findAll()
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.findByCodigo = async (req, res) => {
    try {
        const product = await productService.findByCodigo(req.params.codigo)
        res.json(product)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}

exports.create = async (req, res) => {
    try {
        const product = await productService.create(req.body)
        res.status(201).json(product)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.update = async (req, res) => {
    try {
        const product = await productService.update(req.params.codigo, req.body)
        res.json(product)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.remove = async (req, res) => {
    try {
        await productService.remove(req.params.codigo)
        res.json({ message: 'Produto removido com sucesso' })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}