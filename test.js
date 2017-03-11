import * as tools from './index'
import {parse} from 'url'

const client = new tools.Client({
  adapter (stuff) {
    return stuff
  }
})

describe('getAttribute', () => {
  test('returns a field from a resource\'s attributes', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      attributes: {
        foo: 'bar'
      }
    }

    const attr = tools.getAttribute(resource, 'foo')

    expect(attr).toBe('bar')
  })

  test('returns default argument when field is not defined', () => {
    // using an object as default for it's strong reference
    const default_ = {}
    const resource = {
      type: 'test-resource',
      id: '0',
      attributes: {}
    }

    const attr = tools.getAttribute(resource, 'foo', default_)

    expect(attr).toBe(default_)
  })

  test('returns default argument when attributes is not defined', () => {
    // using an object as default for it's strong reference
    const default_ = {}
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const attr = tools.getAttribute(resource, 'foo', default_)

    expect(attr).toBe(default_)
  })

  test('returns undefined field', () => {
    expect(() => {
      const resource = {
        type: 'test-resource',
        id: '0',
        attributes: {
          foo: 'bar'
        }
      }

      tools.getAttribute(resource, 'buz')
    }).toThrow()
  })

  test('returns undefined when field is not defined', () => {
    expect(() => {
      const resource = {
        type: 'test-resource',
        id: '0'
      }

      tools.getAttribute(resource, 'buz')
    }).toThrow()
  })
})

describe('getLink', () => {
  test('returns a member from a resource\'s links', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      links: {
        zip: 'zap'
      }
    }

    const link = tools.getLink(resource, 'zip')

    expect(link).toBe('zap')
  })

  test('returns default argument when member is not defined', () => {
    // using an object as default for it's strong reference
    const default_ = {}
    const resource = {
      type: 'test-resource',
      id: '0',
      links: {}
    }

    const link = tools.getLink(resource, 'foo', default_)

    expect(link).toBe(default_)
  })

  test('returns default argument when links is not defined', () => {
    // using an object as default for it's strong reference
    const default_ = {}
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const link = tools.getLink(resource, 'foo', default_)

    expect(link).toBe(default_)
  })

  test('throws error when member is not defined', () => {
    expect(() => {
      const resource = {
        type: 'test-resource',
        id: '0',
        links: {
          self: 'bar'
        }
      }

      tools.getLink(resource, 'buz')
    }).toThrow()
  })

  test('throws error when links is not defined', () => {
    expect(() => {
      const resource = {
        type: 'test-resource',
        id: '0'
      }

      tools.getLink(resource, 'buz')
    }).toThrow()
  })
})

describe('getRelationship', () => {
  test('returns a field from a resource\'s relationships', () => {
    const testRel = {}
    const resource = {
      type: 'test-resource',
      id: '0',
      relationships: {
        foo: testRel
      }
    }

    const relationship = tools.getRelationship(resource, 'foo')

    expect(relationship).toBe(testRel)
  })

  test('throws exception when field is undefined', () => {
    expect(() => {
      const resource = {
        type: 'test-resource',
        id: '0',
        attributes: {}
      }

      tools.getRelationship(resource, 'buz')
    }).toThrow()
  })

  test('throws exception when relationships is undefined', () => {
    expect(() => {
      const resource = {
        type: 'test-resource',
        id: '0'
      }

      tools.getRelationship(resource, 'buz')
    }).toThrow()
  })
})

describe('request', () => {
  test('accepts a request method', () => {
    const request = client.request({
      method: 'HEAD',
      url: 'https://example.com'
    })

    expect(request).toHaveProperty('method', 'HEAD')
  })

  test('default request method', () => {
    const request = client.request({
      url: 'https://example.com'
    })

    expect(request).toHaveProperty('method', 'GET')
  })

  test('{json:api} headers', () => {
    const request = client.request({
      url: 'https://example.com'
    })

    expect(request).toHaveProperty('headers.accept', 'application/vnd.api+json')
    expect(request).toHaveProperty('headers.content-type', 'application/vnd.api+json')
  })

  test('{json:api} headers may not be overwritten', () => {
    const request = client.request({
      url: 'https://example.com',
      headers: {
        'accept': 'everything',
        'content-type': 'everything'
      }
    })

    expect(request).toHaveProperty('headers.accept', 'application/vnd.api+json')
    expect(request).toHaveProperty('headers.content-type', 'application/vnd.api+json')
  })

  test('arbitrary headers may be added', () => {
    const request = client.request({
      url: 'https://example.com',
      headers: {
        'x-custom-header': 'socustom'
      }
    })

    expect(request).toHaveProperty('headers.x-custom-header', 'socustom')
  })

  test('request body is serialized JSON', () => {
    const data = {foo: 'bar'}
    const request = client.request({
      url: 'https://example.com',
      data
    })

    expect(request).toHaveProperty('data', JSON.stringify({foo: 'bar'}))
  })
})

describe('fetchRelatedResource', () => {
  test('request url is relationship\'s related link', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      relationships: {
        foo: {
          links: {
            related: 'http://example.com/foo/test'
          }
        }
      }
    }

    const request = client.fetchRelatedResource(resource, 'foo')

    expect(request).toHaveProperty('url', 'http://example.com/foo/test')
  })

  test('request method is GET', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      relationships: {
        foo: {
          links: {
            related: 'http://example.com/foo/test'
          }
        }
      }
    }

    const request = client.fetchRelatedResource(resource, 'foo')

    expect(request).toHaveProperty('method', 'GET')
  })

  test('parameters may be passed into request url', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      relationships: {
        foo: {
          links: {
            related: 'http://example.com/foo/test'
          }
        }
      }
    }

    const request = client.fetchRelatedResource(resource, 'foo', {query: {foo: 'bar'}})

    expect(parse(request.url).query).toContain('foo=bar')
  })
})

describe('fetchResource', () => {
  test('request url is resource\'s self link', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      links: {
        self: 'http://example.com/foo/test'
      }
    }

    const request = client.fetchResource(resource)

    expect(request).toHaveProperty('url', 'http://example.com/foo/test')
  })

  test('request url is built from type and id', () => {
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const request = client.fetchResource(resource)

    expect(request).toHaveProperty('url', '/test-resource/0/')
  })

  test('request method is GET', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      links: {
        self: 'http://example.com/foo/test'
      }
    }

    const request = client.fetchResource(resource)

    expect(request).toHaveProperty('method', 'GET')
  })

  test('parameters may be passed into request url', () => {
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const request = client.fetchResource(resource, {query: {foo: 'bar'}})

    expect(parse(request.url).query).toContain('foo=bar')
  })
})

describe('findResources', () => {
  test('request url is built from type', () => {
    const request = client.findResources('test-resource')

    expect(request).toHaveProperty('url', '/test-resource/')
  })

  test('request method is GET', () => {
    const request = client.findResources('test-resource')

    expect(request).toHaveProperty('method', 'GET')
  })

  test('parameters may be passed into request url', () => {
    const request = client.findResources('test-resource', {query: {foo: 'bar'}})

    expect(parse(request.url).query).toContain('foo=bar')
  })
})

describe('updateResource', () => {
  test('request url is resource\'s self link', () => {
    const resource = {
      type: 'test-resource',
      id: '0',
      links: {
        self: 'http://example.com/foo/test'
      }
    }

    const request = client.updateResource(resource)

    expect(request).toHaveProperty('url', 'http://example.com/foo/test')
  })

  test('request url is built from type and id', () => {
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const request = client.updateResource(resource)

    expect(request).toHaveProperty('url', '/test-resource/0/')
  })

  test('request method is PATCH', () => {
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const request = client.updateResource(resource)

    expect(request).toHaveProperty('method', 'PATCH')
  })

  test('parameters may be passed into request url', () => {
    const resource = {
      type: 'test-resource',
      id: '0'
    }

    const request = client.updateResource(resource, {query: {foo: 'bar'}})

    expect(parse(request.url).query).toContain('foo=bar')
  })
})

describe('createResource', () => {
  test('request url is built from type and id', () => {
    const resource = {
      type: 'test-resource'
    }

    const request = client.createResource(resource)

    expect(request).toHaveProperty('url', '/test-resource/')
  })

  test('request method is POST', () => {
    const resource = {
      type: 'test-resource'
    }

    const request = client.createResource(resource)

    expect(request).toHaveProperty('method', 'POST')
  })

  test('parameters may be passed into request url', () => {
    const resource = {
      type: 'test-resource'
    }

    const request = client.createResource(resource, {query: {foo: 'bar'}})

    expect(parse(request.url).query).toContain('foo=bar')
  })
})
