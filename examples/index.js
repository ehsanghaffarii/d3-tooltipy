(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3-collection'), require('d3-selection')) :
  typeof define === 'function' && define.amd ? define(['d3-collection', 'd3-selection'], factory) :
  (global.d3 = global.d3 || {}, global.d3.tooltipy = factory(global.d3,global.d3));
}(this, (function (d3Collection,d3Selection) { 'use strict';

  /**
   * d3.tooltipy - A simple d3 tooltipy for d3.js Chart Visualization
   * @version v0.0.1
   * @author Ehsan Ghaffar <ghafari.5000@gmail.com>
   * @license MIT
   * @date 2022-May-12
   */


  /**
   * Main function to create a tooltipy
   * @returns {Object} - Returns the tooltipy object
   * @example
   * const tooltipy = d3.tooltipy()
   *  .html(d => `<div>${d.name}</div>`)
   *  .attr('class', 'tooltipy')
   *  .style('background-color', '#fff')
   *  .on('mouseover', d => console.log(d))
   *  .on('mouseout', d => console.log(d))
   */
  function index() {
    var direction   = d3TooltipyDirection,
        offset      = d3TooltipyOffset,
        html        = d3TooltipyHTML,
        rootElement = document.body,
        node        = initNode(),
        svg         = null,
        point       = null,
        target      = null;

    /**
     * The tooltipy svg element
     * @type {SVGElement}
     * @private
     * @memberof d3.tooltipy
     * @instance
     * @member svg
     */
    function tooltipy(vis) {
      svg = getSVGNode(vis);
      if (!svg) return
      point = svg.createSVGPoint();
      rootElement.appendChild(node);
    }

    /**
     * Show the tooltipy
     * @param {Object} d - The data object
     * @param {Object} [event] - The event object
     * @returns {Object} - Returns the tooltipy node
     * @example
     * const tooltipy = d3.tooltipy()
     * tooltipy.show(d, event)
     */
    tooltipy.show = function() {
      var args = Array.prototype.slice.call(arguments);
      if (args[args.length - 1] instanceof SVGElement) target = args.pop();

      var content = html.apply(this, args),
          poffset = offset.apply(this, args),
          dir     = direction.apply(this, args),
          nodel   = getNodeEl(),
          i       = directions.length,
          coords,
          scrollTop  = document.documentElement.scrollTop ||
        rootElement.scrollTop,
          scrollLeft = document.documentElement.scrollLeft ||
        rootElement.scrollLeft;

      nodel.html(content)
        .style('opacity', 1).style('pointer-events', 'all');

      while (i--) nodel.classed(directions[i], false);
      coords = directionCallbacks.get(dir).apply(this);
      nodel.classed(dir, true)
        .style('top', (coords.top + poffset[0]) + scrollTop + 'px')
        .style('left', (coords.left + poffset[1]) + scrollLeft + 'px');

      return tooltipy
    };

    /**
     * Hide the tooltipy
     */
    tooltipy.hide = function() {
      var nodel = getNodeEl();
      nodel.style('opacity', 0).style('pointer-events', 'none');
      return tooltipy
    };

    /**
     * Proxy attr calls to the d3 tip container
     * @param {String} n - The name of the attribute
     * @param {String} v - The value of the attribute
     * @returns {Object} - Returns tooltipy or attribute value
     * @example
     * d3.tip().attr('id', 'test')
     */
    // eslint-disable-next-line no-unused-vars
    tooltipy.attr = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().attr(n)
      }

      var args =  Array.prototype.slice.call(arguments);
      d3Selection.selection.prototype.attr.apply(getNodeEl(), args);
      return tooltipy
    };

    /**
     * Proxy style calls to the d3 tip container
     * Sets or gets a style value
     * @param {String} n - The name of the style
     * @param {String} v - The value of the style
     * @returns {Object} - Returns tooltipy or style property value
     * @example
     * // Set tooltipy style
     * tooltipy.style('background-color', '#ff0000')
     */
    // eslint-disable-next-line no-unused-vars
    tooltipy.style = function(n, v) {
      if (arguments.length < 2 && typeof n === 'string') {
        return getNodeEl().style(n)
      }

      var args = Array.prototype.slice.call(arguments);
      d3Selection.selection.prototype.style.apply(getNodeEl(), args);
      return tooltipy
    };

    /**
     * Set or get the direction of the tooltipy
     * @param {String} v - One of n(north), s(south), e(east), or w(west),
     * nw(northwest), sw(southwest), ne(northeast) or se(southeast)
     * @returns {Object} - Returns tooltipy or direction
     */
    tooltipy.direction = function(v) {
      if (!arguments.length) return direction
      direction = v == null ? v : functor(v);

      return tooltipy
    };

    /**
     * Set or get the offset of the tooltipy
     * @param {Array} v - The offset of the tooltipy
     * @returns {Object} - Returns offset or tooltipy
     * @example
     * tooltipy.offset([20, 20])
     */
    tooltipy.offset = function(v) {
      if (!arguments.length) return offset
      offset = v == null ? v : functor(v);

      return tooltipy
    };

    /**
     * Set or get the html value of the tooltipy
     * @param {String} v - The html value of the tooltipy
     * @returns {Object} - Returns html value or tooltipy
     * @example
     * tooltipy.html('<div>Hello World</div>')
     */
    tooltipy.html = function(v) {
      if (!arguments.length) return html
      html = v == null ? v : functor(v);

      return tooltipy
    };

    /**
     * Set or get the root element anchor of the tooltipy
     * @param {Object} v - The root element anchor of the tooltipy
     * @returns {Object} - Returns root node of tooltipy
     * @example
     * tooltipy.rootElement(document.body)
     */
    tooltipy.rootElement = function(v) {
      if (!arguments.length) return rootElement
      rootElement = v == null ? v : functor(v);

      return tooltipy
    };

    /**
     * Destroy the tooltipy
     * @returns {Object} - Returns the tooltipy object
     * @example
     * tooltipy.destroy()
     */
    tooltipy.destroy = function() {
      if (node) {
        getNodeEl().remove();
        node = null;
      }
      return tooltipy
    };

    /**
     * Initialize the tooltipy node
     * @returns {Object} - Returns the tooltipy node
     * @private
     */
    function d3TooltipyDirection() { return 'n' }
    function d3TooltipyOffset() { return [0, 0] }
    function d3TooltipyHTML() { return ' ' }

     /**
     * Get the direction callback for the tooltipy
     * @param {String} dir - The direction
     * @returns {Function} - Returns the direction callback
     * @private
     */
    var directionCallbacks = d3Collection.map({
          n:  directionNorth,
          s:  directionSouth,
          e:  directionEast,
          w:  directionWest,
          nw: directionNorthWest,
          ne: directionNorthEast,
          sw: directionSouthWest,
          se: directionSouthEast
        }),
        directions = directionCallbacks.keys();

    /**
     * Get the direction north callback
     * @returns {Function} - Returns the direction north callback
     * @private
     */
    function directionNorth() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.n.y - node.offsetHeight,
        left: bbox.n.x - node.offsetWidth / 2
      }
    }

    /**
     * Get the direction south callback
     * @returns {Function} - Returns the direction south callback
     * @private
     */
    function directionSouth() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.s.y,
        left: bbox.s.x - node.offsetWidth / 2
      }
    }

    /**
     * Get the direction east callback
     * @returns {Function} - Returns the direction east callback
     * @private
     */
    function directionEast() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.e.y - node.offsetHeight / 2,
        left: bbox.e.x
      }
    }

    /**
     * Get the direction west callback
     * @returns {Function} - Returns the direction west callback
     * @private
     */
    function directionWest() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.w.y - node.offsetHeight / 2,
        left: bbox.w.x - node.offsetWidth
      }
    }

    /**
     * Get the direction northwest callback
     * @returns {Function} - Returns the direction northwest callback
     * @private
     */
    function directionNorthWest() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.nw.y - node.offsetHeight,
        left: bbox.nw.x - node.offsetWidth
      }
    }

    /**
     * Get the direction northeast callback
     * @returns {Function} - Returns the direction northeast callback
     * @private
     */
    function directionNorthEast() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.ne.y - node.offsetHeight,
        left: bbox.ne.x
      }
    }

    /**
     * Get the direction southwest callback
     * @returns {Function} - Returns the direction southwest callback
     * @private
     */
    function directionSouthWest() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.sw.y,
        left: bbox.sw.x - node.offsetWidth
      }
    }

    /**
     * Get the direction southeast callback
     * @returns {Function} - Returns the direction southeast callback
     * @private
     */
    function directionSouthEast() {
      var bbox = getScreenBBox(this);
      return {
        top:  bbox.se.y,
        left: bbox.se.x
      }
    }

    /**
     * Initialize the tooltipy node
     * @returns {Object} - Returns the tooltipy node
     * @private
     */
    function initNode() {
      var div = d3Selection.select(document.createElement('div'));
      div
        .style('position', 'absolute')
        .style('top', 0)
        .style('opacity', 0)
        .style('pointer-events', 'none')
        .style('box-sizing', 'border-box');

      return div.node()
    }

    /**
     * Get the svg Tooltipy node
     * @returns {Object} - Returns the svg tooltipy node
     * @private
     */
    function getSVGNode(element) {
      var svgNode = element.node();
      if (!svgNode) return null
      if (svgNode.tagName.toLowerCase() === 'svg') return svgNode
      return svgNode.ownerSVGElement
    }

    /**
     * Get the screen element of the node
     * @returns {Object} - Returns the screen element of the node
     * @private
     */
    function getNodeEl() {
      if (node == null) {
        node = initNode();
        // add node to DOM again
        rootElement.appendChild(node);
      }
      return d3Selection.select(node)
    }

    /**
     * Given a shape on the screen, will return an SVGPoint for the directions
     * n(north), s(south), e(east), w(west), ne(northeast), se(southeast),
     * nw(northwest), sw(southwest).
     * @param {Object} shape - The shape
     * @returns {Object} - Returns an Object {n, s, e, w, nw, sw, ne, se}
     * +-+-+
     * |   |
     * +   +
     * |   |
     * +-+-+
     * @private
     */
    function getScreenBBox(targetShape) {
      var targetel  = target || targetShape;

      while (targetel.getScreenCTM == null && targetel.parentNode != null) {
        targetel = targetel.parentNode;
      }

      var bbox       = {},
          matrix     = targetel.getScreenCTM(),
          tbbox      = targetel.getBBox(),
          width      = tbbox.width,
          height     = tbbox.height,
          x          = tbbox.x,
          y          = tbbox.y;

      point.x = x;
      point.y = y;
      bbox.nw = point.matrixTransform(matrix);
      point.x += width;
      bbox.ne = point.matrixTransform(matrix);
      point.y += height;
      bbox.se = point.matrixTransform(matrix);
      point.x -= width;
      bbox.sw = point.matrixTransform(matrix);
      point.y -= height / 2;
      bbox.w = point.matrixTransform(matrix);
      point.x += width;
      bbox.e = point.matrixTransform(matrix);
      point.x -= width / 2;
      point.y -= height / 2;
      bbox.n = point.matrixTransform(matrix);
      point.y += height;
      bbox.s = point.matrixTransform(matrix);

      return bbox
    }

    /**
     * Replace D3JS 3.X d3.functor() function
     * @param {Function} fn - The function
     * @returns {Function} - Returns the function
     * @private
     */
    function functor(v) {
      return typeof v === 'function' ? v : function() {
        return v
      }
    }

    return tooltipy
  }

  return index;

})));
