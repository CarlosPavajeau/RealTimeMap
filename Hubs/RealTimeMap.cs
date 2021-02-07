using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using RealTimeMap.Models;

namespace RealTimeMap.Hubs
{
    public class RealTimeMap : Hub
    {
        public async Task NewEmployeeLocation(EmployeeLocation employeeLocation)
        {
            var random = new Random();
            employeeLocation.Latitude += (float) random.NextDouble();
            employeeLocation.Longitude += (float) random.NextDouble();

            await Clients.All.SendAsync("UpdateEmployeeLocation", employeeLocation);
        }
    }
}