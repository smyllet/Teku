data = {}

exports.addObject = (name, object) => {
    data[name] = object
}

exports.getObject = (name) => {
    return data[name]
}