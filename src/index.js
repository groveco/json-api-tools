/* eslint-disable-next-line */
import { format, resolve } from 'url'
import path from 'path'

export function hasAttribute (resource, attr) {
  /* eslint-disable-next-line */
  return resource.hasOwnProperty('attributes') && resource.attributes.hasOwnProperty(attr)
}

const __d__ = {}
export function getAttribute (resource, attr, default_ = __d__) {
  if (hasAttribute(resource, attr)) {
    return resource.attributes[attr]
  } else if (default_ !== __d__) {
    return default_
  } else {
    throw new Error(`Attribute field, ${attr}, is not defined on this resource.`)
  }
}

export function hasLink (resource, member) {
  /* eslint-disable-next-line */
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
  /* eslint-disable-next-line */
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
    /* eslint-disable-next-line */
    if (options.hasOwnProperty('adapter')) {
      this.adapter = options.adapter
    } else {
      throw new Error('You must provide a network adapter for the client!')
    }

    this.urlPrefix = options.urlPrefix || '/'
  }

  buildLinkFor (type, id = '') {
    return resolve(this.urlPrefix, path.join(type, id, '/'))
  }

  request ({ method = 'GET', url, data, headers = {} }) {
    const settings = {
      method,
      url,
      headers: Object.assign(headers, {
        accept: 'application/vnd.api+json',
        'content-type': 'application/vnd.api+json'
      })
    }

    if (data) {
      settings.data = JSON.stringify(data)
    }

    return this.adapter(settings)
  }

  fetchRelatedResource (resource, rel, params = {}) {
    const { query } = params

    const relatedResource = getRelationship(resource, rel)
    const method = 'GET'
    const url = format({
      pathname: getLink(relatedResource, 'related'),
      query
    })

    return this.request({ method, url })
  }

  fetchResource (resource, params = {}) {
    const { query } = params
    const { type, id } = resource

    const method = 'GET'
    const url = format({
      pathname: getLink(resource, 'self', this.buildLinkFor(type, id)),
      query
    })

    return this.request({ method, url })
  }

  findResources (type, params = {}) {
    const { query } = params

    const method = 'GET'
    const url = format({
      pathname: this.buildLinkFor(type),
      query
    })

    return this.request({ method, url })
  }

  updateResource (resource, params = {}) {
    const { query } = params
    const { type, id } = resource

    const method = 'PATCH'
    const url = format({
      pathname: getLink(resource, 'self', this.buildLinkFor(type, id)),
      query
    })
    const data = { data: resource }

    return this.request({ method, url, data })
  }

  createResource (resource, params = {}) {
    const { query } = params
    const { type } = resource

    const method = 'POST'
    const url = format({
      pathname: this.buildLinkFor(type),
      query
    })
    const data = { data: resource }

    return this.request({ method, url, data })
  }
}
