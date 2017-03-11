import {format} from 'url'
import path from 'path'

export function hasAttribute (resource, attr) {
  return resource.hasOwnProperty('attributes') && resource.attributes.hasOwnProperty(attr)
}

export function getAttribute (resource, attr, default_) {
  if (hasAttribute(resource, attr)) {
    return resource.attributes[attr]
  } else if (default_) {
    return default_
  } else {
    throw new Error(`Attribute field, ${attr}, is not defined on this resource.`)
  }
}

export function hasLink (resource, member) {
  return resource.hasOwnProperty('links') && resource.links.hasOwnProperty(member)
}

export function getLink (resource, member, default_) {
  if (hasLink(resource, member)) {
    return resource.links[member]
  } else if (default_) {
    return default_
  } else {
    throw new Error(`Link, ${member}, is not defined on this resource.`)
  }
}

export function hasRelationship (resource, rel) {
  return resource.hasOwnProperty('relationships') && resource.relationships.hasOwnProperty(rel)
}

export function getRelationship (resource, rel) {
  if (hasRelationship(resource, rel)) {
    return resource.relationships[rel]
  } else {
    throw new Error(`Relationship field, ${rel}, is not defined on this resource.`)
  }
}

export class Client {
  constructor (options = {}) {
    this.adapter = options.adapter
  }

  request ({method = 'GET', url, data, headers = {}}) {
    const settings = {
      method,
      url,
      headers: Object.assign(headers, {
        'accept': 'application/vnd.api+json',
        'content-type': 'application/vnd.api+json'
      })
    }

    if (data) {
      settings.data = JSON.stringify(data)
    }

    return this.adapter(settings)
  }

  fetchRelatedResource (resource, rel, params = {}) {
    const {query} = params

    const relatedResource = getRelationship(resource, rel)
    const method = 'GET'
    const url = format({
      pathname: getLink(relatedResource, 'related'),
      query
    })

    return this.request({method, url})
  }

  fetchResource (resource, params = {}) {
    const {query} = params
    const {type, id} = resource

    const method = 'GET'
    const url = format({
      pathname: getLink(resource, 'self', path.join('/', type, id, '/')),
      query
    })

    return this.request({method, url})
  }

  findResources (type, params = {}) {
    const {query} = params

    const method = 'GET'
    const url = format({
      pathname: path.join('/', type, '/'),
      query
    })

    return this.request({method, url})
  }

  updateResource (resource, params = {}) {
    const {query} = params
    const {type, id} = resource

    const method = 'PATCH'
    const url = format({
      pathname: getLink(resource, 'self', path.join('/', type, id, '/')),
      query
    })
    const data = {data: resource}

    return this.request({method, url, data})
  }

  createResource (resource, params = {}) {
    const {query} = params
    const {type} = resource

    const method = 'POST'
    const url = format({
      pathname: path.join('/', type, '/'),
      query
    })
    const data = {data: resource}

    return this.request({method, url, data})
  }
}
